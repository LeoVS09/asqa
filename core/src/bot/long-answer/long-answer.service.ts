import { Injectable } from '@nestjs/common';
import { EventMeta, MessagesEventBroker, PlatformApiService, TextTypes } from '../interfaces';

// Time when answer generation took too long, and need do something for let user know we working
const LONG_ANSWER_CASES = [
    {type: TextTypes.EXCUSE_LONG_ANSWER, time: 3000},
    {type: TextTypes.EXCUSE_VERY_LONG_ANSWER, time: 15000}
]

@Injectable()
export class LongAnswerService {
    constructor(
        private readonly broker: MessagesEventBroker,
        private readonly platformService: PlatformApiService
    ) {}

    async wrapLongAnswerExcuse<R>(meta: EventMeta, callback: () => Promise<R>): Promise<R> {
        let answered = false
        
        LONG_ANSWER_CASES.map(({time, type}) => setTimeout(async () => {
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
