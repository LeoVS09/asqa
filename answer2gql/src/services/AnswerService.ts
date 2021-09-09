import { DependencyService } from "./DependencyService";
import fetch from 'node-fetch';

export class AnswerService extends DependencyService {

    constructor(
        private readonly url: string
    ) {
        super();
    }

    async isReady() {
        const {status} = await fetch(this.url + '/healthz')
        return status === 200
    }

    async answer(question: string, context: string): Promise<Array<string>> {
        const response = await fetch(this.url + '/predict', {
            method: 'POST',
            body: JSON.stringify({ question, context }),
        })
        return await response.json()
    }
}