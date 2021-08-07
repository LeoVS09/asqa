export interface Passages {
    id: string;
    text: string;
}

export interface Answer {
    score: number;
    text: string;
}

export enum TextTypes {
    EXCUSE_SLOW_ANSWER = 'EXCUSE_SLOW_ANSWER',
    EXCUSE_VERY_SLOW_ANSWER = 'EXCUSE_VERY_SLOW_ANSWER'
}

export interface PlatformApiService {
    searchPassages(question: string): Promise<Array<Passages>>;
    predictAnswers(question: string, context: string): Promise<Array<Answer>>;
    generateText(type: TextTypes): Promise<string>
}

export interface EventMeta {
    /** Data for identify user */
    identity: any
}

export interface MessageToUserEvent {
    text: string;
    meta: EventMeta;
}

export interface MessagesEventBroker {
    sendToUser(event: MessageToUserEvent)
}
