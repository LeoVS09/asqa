import { Injectable } from '@nestjs/common';
import { KafkaService } from 'src/kafka/kafka.service';
import { IEventIdentity, IMessageToUserEvent } from './interfaces';

@Injectable()
export class MessagesEventAdapterService {

    constructor(
        private readonly kafka: KafkaService,
    ) {}

    sendToUser(identity: IEventIdentity, text: string) {
        const event: IMessageToUserEvent = {
            meta: {
                identity,
                timestamp: Date.now()
            },
            text
        }
        return this.kafka.sendToUser(event);
    }
    
}
