import { CommonMessage } from 'src/interfaces';
import { Context } from 'telegraf';
import type { Message } from 'typegram'

export class TelegramMetaDto {
    /** Local telegram id, used only for telegram */
    identity: string;
    provider: 'telegram';

    constructor(ctx: Context) {
        this.identity = String(ctx.message.chat.id)
    }
}

export class TelegramMessageDto implements CommonMessage<TelegramMetaDto> {
    
    meta: TelegramMetaDto;
    text: string;

    constructor(ctx: Context) {
        this.meta = new TelegramMetaDto(ctx)
        this.text = (ctx.message as Message.TextMessage).text
    }
    
}