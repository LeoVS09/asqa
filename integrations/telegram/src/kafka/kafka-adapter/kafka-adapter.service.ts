import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { IKafkaService, MessagesService, ToKafkaMessageDto, ToTelegramMessageDto } from 'src/messages';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class KafkaAdapterService implements IKafkaService {

    private topic: string

    constructor(
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka,
        private readonly configService: ConfigService,
        private readonly messages: MessagesService
    ) {
        this.messages.registerKafka(this)
    }

    async onModuleInit() {
        this.topic = this.configService.get('MESSAGE_FROM_USER_TOPIC')
        if (!this.topic) 
            throw new Error('Cannot find environment variable: MESSAGE_FROM_USER_TOPIC')

        this.client.subscribeToResponseOf(this.topic);
        await this.client.connect();
    }

    send(message: ToKafkaMessageDto) {
        return this.client.emit(this.topic, message);
    }

    onMessage(message: ToTelegramMessageDto) {
        this.messages.onKafkaMessage(message);
    }

}
