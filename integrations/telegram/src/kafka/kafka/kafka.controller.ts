import { Controller, ValidationPipe } from '@nestjs/common';
import { KafkaAdapterService } from '../kafka-adapter/kafka-adapter.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ToTelegramMessageDto } from 'src/messages';

// @nets/config cannot be used for define static parametor for decorator
const {SEND_TO_USER_TOPIC} = process.env
if (!SEND_TO_USER_TOPIC)
    throw new Error("Cannot find enviroment variable SEND_TO_USER_TOPIC")

@Controller('kafka')
export class KafkaController {

    constructor(
        private readonly adapter: KafkaAdapterService
    ) {
    }

    @EventPattern(SEND_TO_USER_TOPIC)
    getHello(@Payload('value', new ValidationPipe()) value: ToTelegramMessageDto) {
      return this.adapter.onMessage(value);
    }
}
