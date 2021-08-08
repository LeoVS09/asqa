import { Controller, ValidationPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BotService } from '../bot/bot.service';
import { MessageFromUserEventDto } from '../events';
import { MESSAGE_FROM_USER_TOPIC } from '../topics';

@Controller('bot')
export class BotController {

    constructor(
        private readonly bot: BotService
    ){}

    @EventPattern(MESSAGE_FROM_USER_TOPIC)
    getHello(@Payload('value', new ValidationPipe()) value: MessageFromUserEventDto) {
      debugger;
      return this.bot.onMessage(value.text, value.meta);
    }
}
