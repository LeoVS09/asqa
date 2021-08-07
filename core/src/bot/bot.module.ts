import { Module } from '@nestjs/common';
import { AnswererService } from './answerer/answerer.service';
import { SlowAnswerService } from './slow-answer/slow-answer.service';
import { BotService } from './bot/bot.service';
import { PlatformApiAdapterService } from './platform-api-adapter/platform-api-adapter.service';
import { MessagesEventAdapterService } from './messages-event-adapter/messages-event-adapter.service';

@Module({
  providers: [AnswererService, SlowAnswerService, BotService, PlatformApiAdapterService, MessagesEventAdapterService]
})
export class BotModule {}
