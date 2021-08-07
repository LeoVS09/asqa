import { Injectable } from '@nestjs/common';
import { AnswererService } from '../answerer/answerer.service';
import { EventMeta, MessagesEventBroker } from '../interfaces';
import { LongAnswerService } from '../long-answer/long-answer.service';

@Injectable()
export class BotService {

    constructor(
        private readonly broker: MessagesEventBroker,
        private readonly longAnswerService: LongAnswerService,
        private readonly answererService: AnswererService
    ) {}

    async onQuestion(question: string, meta: EventMeta) {

        const answer = await this.longAnswerService.wrapLongAnswerExcuse<string>(meta, () => {
            return this.answererService.answer(question);
        })

        return this.broker.sendToUser({text: answer, meta: meta})
    }
}
