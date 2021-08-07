import { Module } from '@nestjs/common';
import { AnswererService } from './answerer/answerer.service';
import { LongAnswerService } from './long-answer/long-answer.service';
import { BotService } from './bot/bot.service';
import { PlatformApiAdapterService } from './platform-api-adapter/platform-api-adapter.service';

@Module({
  providers: [AnswererService, LongAnswerService, BotService, PlatformApiAdapterService]
})
export class BotModule {}
