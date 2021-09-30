import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService {
    sendToUserTopic: string;

    constructor(
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka,
        private readonly configService: ConfigService
    ) {}

    async onModuleInit() {
        this.sendToUserTopic = this.configService.get('SEND_TO_USER_TOPIC')
        if (!this.sendToUserTopic) 
            throw new Error('Cannot find environment variable: SEND_TO_USER_TOPIC')


        this.client.subscribeToResponseOf(this.sendToUserTopic);
        await this.client.connect();
    }

    public sendToUser(event: any) {
      return this.client.emit(this.sendToUserTopic, event);
    }
    
}
