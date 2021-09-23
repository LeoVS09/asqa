import { CommonMessage } from "./interfaces";

export interface IMessageBroker {
    on: (callback: (message: CommonMessage) => void) => void;
    send: (message: CommonMessage) => void;
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