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
    EXCUSE_VERY_SLOW_ANSWER = 'EXCUSE_VERY_SLOW_ANSWER',
    EXCUSE_ERROR = 'EXCUSE_ERROR',
}

export interface PlatformApiService {
    searchPassages(question: string): Promise<Array<Passages>>;
    predictAnswers(question: string, context: string): Promise<Array<Answer>>;
    generateText(type: TextTypes): Promise<string>
}

export interface IEventMeta {
    /** Data for identify user */
    identity: any
}

export interface IEventWithIdentity {
    meta: IEventMeta;
}

export interface IMessageToUserEvent extends IEventWithIdentity {
    text: string;
}

export interface IMessageFromUserEvent extends IEventWithIdentity {
    text: string;
}

export interface MessagesEventBroker {
    sendToUser(event: IMessageToUserEvent)
}
