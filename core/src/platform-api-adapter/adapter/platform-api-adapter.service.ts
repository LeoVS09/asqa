import { Injectable } from '@nestjs/common';
import { Answer, Passages, PlatformApiService, TextTypes } from '../../bot/interfaces';
import { PlatformGraphqlClientService } from '../clients';
import { TextGenerationPlaceholderService } from '../text-generation-placeholder.service';
import { answerGql, searchPassagesGql } from './queries';
import { SearchPassages, SearchPassagesVariables } from './__generated__/SearchPassages';
import { Answer as AnswerGql, AnswerVariables } from './__generated__/Answer';

@Injectable()
export class PlatformApiAdapterService implements PlatformApiService {

    constructor(
        private readonly textGenerationService: TextGenerationPlaceholderService,
        private readonly client: PlatformGraphqlClientService
    ) {}

    async searchPassages(question: string): Promise<Passages[]> {
        const { search: { nodes } } = await this.client.query<SearchPassages, SearchPassagesVariables>({
            query: searchPassagesGql,
            variables: { questions: [question] },
        })
        if (nodes.length !== 1) 
            throw new Error("Unexpected count of passages in batch")
        
        const passages: Array<Passages> = nodes[0].passages.map(p => ({
            id: p.wiki_id,
            text: p.passage_text
        }))

        return passages

    }

    async predictAnswers(question: string, context: string): Promise<Answer[]> {
        const { answer: { nodes } } = await this.client.query<AnswerGql, AnswerVariables>({
            query: answerGql,
            variables: { question: question, context },
        })

        const answers: Array<Answer> = nodes.map(({ text }) => ({
            text,
            score: 1 // TODO: add answer score generation
        }))

        return answers
    }
    
    generateText(type: TextTypes): Promise<string> {
        return this.textGenerationService.generateText(type);
    }

}
