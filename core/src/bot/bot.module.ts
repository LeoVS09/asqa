import { Module } from '@nestjs/common';
import { AnswererService } from './answerer.service';
import { SlowAnswerService } from './slow-answer.service';
import { BotService } from './bot.service';
import { MessagesEventAdapterService } from './messages-event-adapter.service';
import { BotController } from './bot.controller';
import { PlatformApiAdapterModule } from 'src/platform-api-adapter/platform-api-adapter.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    PlatformApiAdapterModule,
    KafkaModule
  ],
  providers: [
    AnswererService,
    SlowAnswerService, 
    BotService, 
    MessagesEventAdapterService,
  ],
  controllers: [BotController]
})
export class BotModule {}
