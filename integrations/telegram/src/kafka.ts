import {
  Kafka,
  SASLOptions,
  logLevel,
  KafkaConfig,
  CompressionTypes,
} from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

interface Payload {
  identity: string;
  text: string;
}

const getSASLOptions = (): SASLOptions => {
  const { KAFKA_USERNAME: username, KAFKA_PASSWORD: password } = process.env;
  return username && password
    ? { username, password, mechanism: 'plain' }
    : undefined;
};

const sasl = getSASLOptions();
const ssl = !!sasl;

const options: KafkaConfig = {
  clientId: 'asqa-client',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  logLevel: logLevel.INFO,
  ssl,
  sasl,
};
const kafka = new Kafka(options);
const producer = kafka.producer();

type ConsumerCallback = (data: Payload) => Promise<void>;

export const createKafkaConsumer = async (callback: ConsumerCallback) => {
  const { SEND_TO_USER_TOPIC: topic } = process.env;

  const consumer = kafka.consumer({ groupId: 'asqa-group' });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  return consumer
    .run({
      eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value.toString());
        return callback(data);
      },
    })
    .catch((e) =>
      kafka
        .logger()
        .error(`[${options.clientId}] ${e.message}`, { stack: e.stack }),
    );
};

export const sendMessageToKafka = async (payload: Payload) => {
  const { MESSAGE_FROM_USER_TOPIC: topic } = process.env;

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

  return producer
    .send({
      topic,
      compression: CompressionTypes.None,
      messages,
    })
    .catch((e) =>
      kafka
        .logger()
        .error(`[${options.clientId}] ${e.message}`, { stack: e.stack }),
    );
};
