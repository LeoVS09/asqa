import { ConfigService } from "@nestjs/config";
import { KafkaOptions, Transport } from "@nestjs/microservices";

const random = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

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
            // Random group id resolve case of long join to kafka
            // TODO: find better way to resolve it
            groupId: `${configService.get('KAFKA_CONSUMER_GROUP_ID')}-${random(1, 10000)}`,
            allowAutoTopicCreation: true,
        }
    }
})