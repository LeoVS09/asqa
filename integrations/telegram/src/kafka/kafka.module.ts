import { Module } from '@nestjs/common';
import { MessagesModule } from 'src/messages/messages.module';
import { KafkaAdapterService } from './kafka-adapter.service';
import { KafkaController } from './kafka.controller';
import { ConfigService } from '@nestjs/config';
import { generateKafkaClientOptions } from './kafka.configuration';
import { ClientProxyFactory } from '@nestjs/microservices';

@Module({
  imports: [MessagesModule],
  providers: [
    { 
      provide: 'KAFKA_CLIENT', 
      useFactory: (configService: ConfigService) => {
        const options = generateKafkaClientOptions(configService)
        return ClientProxyFactory.create(options);
      },
      inject: [ConfigService],
    },
    KafkaAdapterService
  ],
  controllers: [KafkaController]
})
export class KafkaModule {}
