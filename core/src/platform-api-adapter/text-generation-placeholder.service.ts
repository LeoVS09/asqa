import { Injectable } from '@nestjs/common';
import { TextTypes } from '../bot/interfaces';

const textGenerationMap: {[type: string]: Array<string>} = {
    [TextTypes.EXCUSE_ERROR]: ['Sorry, something went wrong :(', 'Eh, I\'m feels bad :(', 'Oh, something broken in me :('],
    [TextTypes.EXCUSE_SLOW_ANSWER]: ['Hm, neeed think a little bit...', 'Interesting, will make research!', 'Yeah! Good question! Need think :)', 'From what to start...'],
    [TextTypes.EXCUSE_VERY_SLOW_ANSWER]: ['It more complex than I was thinking...', 'I think it need more researches!', 'Oh, I need more time...']
}

/**
 * Pleseholder service to generate text from predefained phrases, 
 * until we not add real DNN service for it
 */
@Injectable()
export class TextGenerationPlaceholderService {

    async generateText(type: TextTypes): Promise<string> {

        const replays = textGenerationMap[type]
        if(!replays || !replays.length) 
            throw new Error(`Text type ${type} not found in predefained replayes map`);

        return replays[Math.floor(Math.random() * replays.length)]
    }


}
