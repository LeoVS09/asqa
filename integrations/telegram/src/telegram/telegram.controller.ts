import { Controller, Inject } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { TelegrafProviderService } from './telegraf-provider.service';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {

    bot: Telegraf

    constructor(
        private readonly telgrafProvider: TelegrafProviderService,
        private readonly telegramService: TelegramService
    ) {
        this.bot = this.telgrafProvider.getBot()

        this.bot.start(ctx => this.telegramService.onStart(ctx))
        this.bot.on('text', ctx => this.telegramService.onMessage(ctx))   
    }

}
