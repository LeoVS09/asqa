import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { MessagesEventBroker, IEventIdentity, IMessageToUserEvent } from './interfaces';

@Injectable()
export class MessagesEventAdapterService implements MessagesEventBroker {

    topic: string;

    constructor(
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka,
        private readonly configService: ConfigService
    ) {}

    async onModuleInit() {
        this.topic = this.configService.get('SEND_TO_USER_TOPIC')
        if (!this.topic) 
            throw new Error('Cannot find environment variable: SEND_TO_USER_TOPIC')


        this.client.subscribeToResponseOf(this.topic);
        await this.client.connect();
    }

    sendToUser(identity: IEventIdentity, text: string) {
        const event: IMessageToUserEvent = {
            meta: {
                identity,
                timestamp: Date.now()
            },
            text
        }
      return this.client.emit(this.topic, event);
    }
    
}
