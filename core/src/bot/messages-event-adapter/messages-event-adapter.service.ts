import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { MessagesEventBroker, IMessageToUserEvent } from '../interfaces';
import { SEND_TO_USER_TOPIC } from '../topics';

@Injectable()
export class MessagesEventAdapterService implements MessagesEventBroker {
    constructor(
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka
    ) {}

    async onModuleInit() {
        this.client.subscribeToResponseOf(SEND_TO_USER_TOPIC);
        await this.client.connect();
    }

    sendToUser(event: IMessageToUserEvent) {
      return this.client.emit(SEND_TO_USER_TOPIC, event);
    }
    
}
