export interface Message<Meta = any> {
    meta: Meta
    text: string;
}

export interface IMessageBroker {
    on: (callback: (message: Message) => void) => void;
    send: (message: Message) => void;
}

export class Retranslator {

    constructor(
        private readonly brokers: Array<IMessageBroker>
    ){}

    /** Propagate messages from one broker to all other */
    start() {
        for (const brokerA of this.brokers) 
            for (const brokerB of this.brokers) {
                if (brokerA === brokerB) 
                    continue;

                brokerA.on(message => {
                    brokerB.send(message);
                });
            }
    }
}