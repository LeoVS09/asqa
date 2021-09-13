import { Module } from '@nestjs/common';
import { AnswererService } from './answerer/answerer.service';
import { SlowAnswerService } from './slow-answer/slow-answer.service';
import { BotService } from './bot/bot.service';
import { MessagesEventAdapterService } from './messages-event-adapter/messages-event-adapter.service';
import { BotController } from './controller/bot.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PlatformApiAdapterModule } from 'src/platform-api-adapter/platform-api-adapter.module';
import { generateKafkaClientOptions } from './KafkaClientOptions';

export {
  generateKafkaClientOptions
}

@Module({
  imports: [
    PlatformApiAdapterModule
  ],
  providers: [
    { 
      provide: 'KAFKA_CLIENT', 
      useFactory: (configService: ConfigService) => {
        const options = generateKafkaClientOptions(configService)
        return ClientProxyFactory.create(options);
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
