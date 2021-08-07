import { Controller, Inject } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

@Controller('bot')
export class BotController {

    constructor(
        @Inject('KAFKA_CLIENT') private readonly client: ClientKafka
    ) {}

    async onModuleInit() {
        this.client.subscribeToResponseOf('hero.kill.dragon');
        await this.client.connect();
    }
      

    @MessagePattern('my-first-topic') // Our topic name
    getHello(@Payload() message) {
      console.log(message.value);
      this.client.emit('hero.kill.dragon', 'Hello Kafka');
      console.log('Message emited');
      return 'Hello World';
    }
}
