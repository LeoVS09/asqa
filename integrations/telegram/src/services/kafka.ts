import {
  Kafka,
  SASLOptions,
  logLevel,
  KafkaConfig,
  CompressionTypes,
  Consumer,
  Producer,
} from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';



const getSASLOptions = (username: string, password: string): SASLOptions => 
  username && password
    ? { username, password, mechanism: 'plain' }
    : undefined;


interface KafkaAdapterOptions {
  config: KafkaConfig
  topics: {
    toUser: string
    fromUser: string
  }
}

export function extractKafkaEnvironmentVariables(): KafkaAdapterOptions {
  const {KAFKA_BOOTSTRAP_SERVER: broker} = process.env
  if (!broker) 
    throw new Error("Cannot find enviroment variable KAFKA_BOOTSTRAP_SERVER")
  console.log('Will use broker', broker)

  const {SEND_TO_USER_TOPIC: toUserTopic} = process.env
  if (!toUserTopic)
    throw new Error("Cannot find enviroment variable SEND_TO_USER_TOPIC")

  const {MESSAGE_FROM_USER_TOPIC: fromUserTopic} = process.env
  if (!fromUserTopic)
    throw new Error("Cannot find enviroment variable MESSAGE_FROM_USER_TOPIC")

  const { KAFKA_USERNAME: username } = process.env
  if(!username) 
    console.warn('Didn\'t have KAFKA_USERNAME enviroment variable')
  
  const {KAFKA_PASSWORD: password} = process.env
  if(!password) 
    console.warn('Didn\'t have KAFKA_PASSWORD enviroment variable')

  const sasl = getSASLOptions(username, password);
  const ssl = !!sasl;
  if (!sasl) 
    console.warn('Not have credentials for SASL configuration, will work without ssl')
  
  return {
    config: {
      clientId: 'asqa-client',
      brokers: [broker],
      logLevel: logLevel.INFO,
      ssl,
      sasl,
    },
    topics: {
      toUser: toUserTopic,
      fromUser: fromUserTopic,
    }
  }
}

interface Payload {
  meta: { identity: string };
  text: string;
}

type ConsumerCallback = (data: Payload) => Promise<void>;

export class KafkaAdapter {

  private readonly kafka: Kafka
  private readonly consumer: Consumer
  private readonly producer: Producer

  private areWasConnect: boolean = false
  
  constructor(private readonly options: KafkaAdapterOptions) {
    this.kafka = new Kafka(this.options.config);
    this.consumer = this.kafka.consumer({ groupId: 'asqa-group' });
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });

    // Need asyncroniusly connect to kafka
  }

  public isReady(): boolean {
    // TODO: implement real health check
    //  Current solutions too complex https://github.com/tulios/kafkajs/issues/452
    //  Hopefully someday will exists default implementation https://github.com/tulios/kafkajs/issues/1010
    return this.areWasConnect
  }

  async connect() {
    await this.consumer.connect();
    await this.producer.connect();

    this.areWasConnect = true

    console.log('Successfully connected to kafka')
  };

  async stop() {
    this.areWasConnect = false

    await this.consumer.disconnect();
    await this.producer.disconnect();
  };

  public onToUserMessage(callback: ConsumerCallback) {
    return this.consumeKafkaMessages(this.options.topics.toUser, callback)
  }

  public sendFromUserMessage(payload: Payload) {
    return this.sendMessageToKafka(this.options.topics.fromUser, payload)
  }

  private async consumeKafkaMessages(topic, callback: ConsumerCallback) {
    console.log('Will listen messages from', topic)
    await this.consumer.subscribe({ topic, fromBeginning: false });
  
    return this.consumer
      .run({
        eachMessage: async ({ message }) => {
          const data = JSON.parse(message.value.toString());
          return callback(data);
        },
      })
      .catch((e) =>
        this.kafka
          .logger()
          .error(`[${this.options.config.clientId}] ${e.message}`, { stack: e.stack }),
      );
  };
  
  private async sendMessageToKafka(topic, payload: Payload) {
    console.log('Will send message to', topic)
    const uuid = uuidv4();
    const messages = [
      {
        key: `key-${uuid}`,
        value: JSON.stringify(payload),
        headers: {
          'correlation-id': `${uuid}-${Date.now()}`,
        },
      },
    ];
  
    return this.producer
      .send({
        topic,
        compression: CompressionTypes.None,
        messages,
      })
      .catch((e) =>
        this.kafka
          .logger()
          .error(`[${this.options.config.clientId}] ${e.message}`, { stack: e.stack }),
      );
  };
}