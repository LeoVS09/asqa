import { Module } from '@nestjs/common';
import { AnswererService } from './answerer/answerer.service';
import { LongAnswerService } from './long-answer/long-answer.service';
import { BotService } from './bot/bot.service';

@Module({
  providers: [AnswererService, LongAnswerService, BotService]
})
export class BotModule {}
