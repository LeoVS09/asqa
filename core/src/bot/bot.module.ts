import { Module } from '@nestjs/common';
import { AnswererService } from './answerer/answerer.service';
import { SlowAnswerService } from './slow-answer/slow-answer.service';
import { BotService } from './bot/bot.service';
import { PlatformApiAdapterService } from './platform-api-adapter/platform-api-adapter.service';
import { MessagesEventAdapterService } from './messages-event-adapter/messages-event-adapter.service';
import { BotController } from './controller/bot.controller';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { TextGenerationPlacholderService } from './platform-api-adapter/text-generation-placholder.service';
import { PlatformGraphqlClientService } from './platform-api-adapter/platform-graphql-client.service';

@Module({
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
              allowAutoTopicCreation: true
            }
          }
        });
      },
      inject: [ConfigService],
    },
    AnswererService,
    SlowAnswerService, 
    BotService, 
    PlatformApiAdapterService, 
    MessagesEventAdapterService,
    TextGenerationPlacholderService,
    PlatformGraphqlClientService,
  ],
  controllers: [BotController]
})
export class BotModule {}
