import { ConfigService } from "@nestjs/config";
import { KafkaOptions, Transport } from "@nestjs/microservices";

// Class implementation not correctly work with client,
//  use generator instead
export const generateKafkaClientOptions = (configService: ConfigService): KafkaOptions => ({
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: configService.get('KAFKA_CLIENT_ID'),
            brokers: [configService.get('KAFKA_BROKER_URL')],
        },
        consumer: {
            groupId: configService.get('KAFKA_CONSUMER_GROUP_ID'),
            allowAutoTopicCreation: true,
            // fix case when message replayed by kafka
            // on long response processing
            // Issue: https://github.com/tulios/kafkajs/issues/130
            sessionTimeout: 5 * 60 * 1000, // 5 minutes,
            heartbeatInterval: 3 * 1000 // 3 seconds
        }
    }
})