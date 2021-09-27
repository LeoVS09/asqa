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
        }
    }
})