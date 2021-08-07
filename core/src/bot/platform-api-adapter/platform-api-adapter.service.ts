import { Injectable } from '@nestjs/common';
import { Answer, Passages, PlatformApiService, TextTypes } from '../interfaces';

@Injectable()
export class PlatformApiAdapterService implements PlatformApiService {
    searchPassages(question: string): Promise<Passages[]> {
        throw new Error('Method not implemented.');
    }
    predictAnswers(question: string, context: string): Promise<Answer[]> {
        throw new Error('Method not implemented.');
    }
    generateText(type: TextTypes): Promise<string> {
        throw new Error('Method not implemented.');
    }

}
