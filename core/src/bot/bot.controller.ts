import { Controller, ValidationPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BotService } from './bot.service';
import { MessageFromUserEventDto } from './events';

// @nets/config cannot be used for define static parametor for decorator
const {MESSAGE_FROM_USER_TOPIC} = process.env
if (!MESSAGE_FROM_USER_TOPIC)
    throw new Error("Cannot find enviroment variable MESSAGE_FROM_USER_TOPIC")

@Controller('bot')
export class BotController {

    constructor(
        private readonly bot: BotService
    ){}

    @EventPattern(MESSAGE_FROM_USER_TOPIC)
    getHello(@Payload('value', new ValidationPipe()) value: MessageFromUserEventDto) {
        console.log(value);
      return this.bot.onMessage(value.text, value.meta);
    }
}
