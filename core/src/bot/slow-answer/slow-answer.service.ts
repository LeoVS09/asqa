import { Injectable } from '@nestjs/common';
import { IEventMeta, TextTypes } from '../interfaces';
import { MessagesEventAdapterService } from '../messages-event-adapter/messages-event-adapter.service';
import { PlatformApiAdapterService } from '../../platform-api-adapter';

// Time when answer generation took too long, and need do something for let user know we working
const SLOW_ANSWER_CASES = [
    {type: TextTypes.EXCUSE_SLOW_ANSWER, time: 5000},
    {type: TextTypes.EXCUSE_VERY_SLOW_ANSWER, time: 20000}
]

@Injectable()
export class SlowAnswerService {
    constructor(
        private readonly broker: MessagesEventAdapterService,
        private readonly platformService: PlatformApiAdapterService
    ) {}

    // TODO: create decorator, instead of explisit method usage
    async wrapSlowAnswerExcuse<R>(meta: IEventMeta, callback: () => Promise<R>): Promise<R> {
        let answered = false
        
        SLOW_ANSWER_CASES.map(({time, type}) => setTimeout(async () => {
            if (answered)
                return
            
            const excuse = await this.platformService.generateText(type)
            if (answered)
                return

            this.broker.sendToUser({text: excuse, meta})
        }, time))

        try {
            const answer = await callback()
            answered = true

            return answer
        
        } catch (err) {
            answered = true

            throw err
        }
    }
}
