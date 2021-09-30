import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { generateKafkaClientOptions } from './kafka.configuration';

@Module({
    providers: [
    { 
        provide: 'KAFKA_CLIENT', 
        useFactory: (configService: ConfigService) => {
            const options = generateKafkaClientOptions(configService)
            return ClientProxyFactory.create(options);
        },
        inject: [ConfigService],
    }, 
        KafkaService
    ],
    exports: [KafkaService]
})
export class KafkaModule {}
