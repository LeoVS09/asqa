import { Injectable } from '@nestjs/common';
import { EventMeta, TextTypes } from '../interfaces';
import { MessagesEventAdapterService } from '../messages-event-adapter/messages-event-adapter.service';
import { PlatformApiAdapterService } from '../platform-api-adapter/platform-api-adapter.service';

// Time when answer generation took too long, and need do something for let user know we working
const SLOW_ANSWER_CASES = [
    {type: TextTypes.EXCUSE_SLOW_ANSWER, time: 3000},
    {type: TextTypes.EXCUSE_VERY_SLOW_ANSWER, time: 15000}
]

@Injectable()
export class SlowAnswerService {
    constructor(
        private readonly broker: MessagesEventAdapterService,
        private readonly platformService: PlatformApiAdapterService
    ) {}

    async wrapSlowAnswerExcuse<R>(meta: EventMeta, callback: () => Promise<R>): Promise<R> {
        let answered = false
        
        SLOW_ANSWER_CASES.map(({time, type}) => setTimeout(async () => {
            if (answered)
                return
            
            const excuse = await this.platformService.generateText(type)
            if (answered)
                return

            this.broker.sendToUser({text: excuse, meta})
        }, time))

        const answer = await callback()
        answered = true

        return answer
    }
}
