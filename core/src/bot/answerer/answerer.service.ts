import { Injectable } from '@nestjs/common';
import { PlatformApiAdapterService } from '../../platform-api-adapter';

@Injectable()
export class AnswererService {
    constructor(
        private readonly platformService: PlatformApiAdapterService
    ){}

    async answer(question: string): Promise<string> {
        const passages = await this.platformService.searchPassages(question);

        const context = this.generateContext(passages.map(({text}) => text))

        const answers = await this.platformService.predictAnswers(question, context)
        const answer = answers[Math.floor(Math.random() * answers.length)]

        return answer.text
    }

    private generateContext(passages: Array<string>): string {
        return "<P> " + passages.join(" <P> ")
    }

}