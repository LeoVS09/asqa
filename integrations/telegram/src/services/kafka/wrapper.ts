import { Kafka, Consumer, Producer, KafkaConfig, CompressionTypes } from "kafkajs";
import { v4 as uuidv4 } from 'uuid';
import { buildKafkaConfig } from "./configuration";

export interface ConsumerCallback<Payload = {}> {
    (data: Payload): Promise<void>;
  }
  
  export class KafkaWrapper<Payload = {}> {
  
    private readonly config: KafkaConfig;
    private readonly kafka: Kafka
    private readonly consumer: Consumer
    private readonly producer: Producer
  
    private areWasConnect: boolean = false
    
    constructor() {
        this.config = buildKafkaConfig()
        this.kafka = new Kafka(this.config);
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
  
    protected async consumeMessages(topic, callback: ConsumerCallback<Payload>) {
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
                .error(`[${this.config.clientId}] ${e.message}`, { stack: e.stack }),
            );
    };
    
    protected async sendMessage(topic, payload: Payload) {
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
                .error(`[${this.config.clientId}] ${e.message}`, { stack: e.stack }),
            );
        };
  }
  