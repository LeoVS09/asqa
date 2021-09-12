import { Module } from '@nestjs/common';
import { AnswererService } from './answerer/answerer.service';
import { SlowAnswerService } from './slow-answer/slow-answer.service';
import { BotService } from './bot/bot.service';
import { MessagesEventAdapterService } from './messages-event-adapter/messages-event-adapter.service';
import { BotController } from './controller/bot.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PlatformApiAdapterModule } from 'src/platform-api-adapter/platform-api-adapter.module';

@Module({
  imports: [
    PlatformApiAdapterModule
  ],
  providers: [
    { 
      provide: 'KAFKA_CLIENT', 
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
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
              sessionTimeout: 2 * 60 * 1000, // 2 minutes,
              heartbeatInterval: 3 * 1000 // 3 seconds
            }
          }
        });
      },
      inject: [ConfigService],
    },
    AnswererService,
    SlowAnswerService, 
    BotService, 
    MessagesEventAdapterService,
  ],
  controllers: [BotController]
})
export class BotModule {}
