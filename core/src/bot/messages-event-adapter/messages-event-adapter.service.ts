import { Injectable } from '@nestjs/common';
import { MessagesEventBroker, MessageToUserEvent } from '../interfaces';

@Injectable()
export class MessagesEventAdapterService implements MessagesEventBroker {
    sendToUser(event: MessageToUserEvent) {
        throw new Error('Method not implemented.');
    }
    
}
