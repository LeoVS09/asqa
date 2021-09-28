import { Module } from '@nestjs/common';
import { AnswererService } from './answerer.service';
import { SlowAnswerService } from './slow-answer.service';
import { BotService } from './bot.service';
import { MessagesEventAdapterService } from './messages-event-adapter.service';
import { BotController } from './bot.controller';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PlatformApiAdapterModule } from 'src/platform-api-adapter/platform-api-adapter.module';
import { generateKafkaClientOptions } from '../kafka';

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
