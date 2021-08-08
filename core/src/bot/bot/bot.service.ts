import { Injectable } from '@nestjs/common';
import { AnswererService } from '../answerer/answerer.service';
import { IEventMeta, TextTypes } from '../interfaces';
import { MessagesEventAdapterService } from '../messages-event-adapter/messages-event-adapter.service';
import { PlatformApiAdapterService } from '../platform-api-adapter/platform-api-adapter.service';
import { SlowAnswerService } from '../slow-answer/slow-answer.service';

@Injectable()
export class BotService {

    constructor(
        private readonly broker: MessagesEventAdapterService,
        private readonly slowAnswerService: SlowAnswerService,
        private readonly answererService: AnswererService,
        private readonly platformService: PlatformApiAdapterService
    ) {}

    async onMessage(message: string, meta: IEventMeta) {
        try {

            const answer = await this.slowAnswerService.wrapSlowAnswerExcuse<string>(meta, () => 
                // Will hope this question
                // TODO: add check it is actually question
                this.answererService.answer(message)
            )

            return this.broker.sendToUser({text: answer, meta: meta})

        } catch(error) { 
            // TODO: make interceptor instead explisit catch
            const excuse = await this.platformService.generateText(TextTypes.EXCUSE_ERROR)
            this.broker.sendToUser({text: excuse, meta})

            throw error
        }
    }
}
