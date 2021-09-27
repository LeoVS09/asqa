import { Injectable } from '@nestjs/common';
import { ChatsStorageService } from 'src/chats/chats-storage.service';
import { ToTelegramMessageDto } from 'src/messages';
import { ITelegramService, MessagesService } from 'src/messages/messages.service';
import { Context, Telegraf } from 'telegraf';
import { ChatDto, FromTelegramMessageDto } from './models';
import { TelegrafProviderService } from './telegraf-provider.service';

@Injectable()
export class TelegramService implements ITelegramService {

    private bot: Telegraf

    constructor(
        private readonly messagesService: MessagesService,
        private readonly chatsStorage: ChatsStorageService,
        private readonly telgrafProvider: TelegrafProviderService
    ) {
        this.bot = this.telgrafProvider.getBot()

        this.messagesService.registerTelegram(this)
    }

    async onStart(ctx: Context): Promise<void> {
        const saving = this.chatsStorage.saveIfNotExists(new ChatDto(ctx))

        ctx.reply(await this.messagesService.getHello())

        await saving
    }

    async onMessage(ctx: Context): Promise<void> {
        const saving = this.chatsStorage.saveIfNotExists(new ChatDto(ctx))

        this.messagesService.onTelegramMessage(new FromTelegramMessageDto(ctx))
        await saving
    }

    send({meta, text}: ToTelegramMessageDto) {
        this.bot.telegram.sendMessage(meta.identity, text)
    }
}
