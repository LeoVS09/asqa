import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class TelegrafProviderService {

    private bot: Telegraf

    constructor(
        private readonly configService: ConfigService
    ) {
        const telegramKey = this.configService.get('TELEGRAM_BOT_API_KEY')
        if (!telegramKey) 
            throw new Error('Cannot find environment variable: TELEGRAM_BOT_API_KEY')
  
        this.bot = new Telegraf(telegramKey)
    }

    async onModuleInit(): Promise<void> {
        await this.bot.launch()
    }

    public getBot(): Telegraf {
        return this.bot
    }

}
