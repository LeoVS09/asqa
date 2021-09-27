import { ToKafkaMessageDto, ToKafkaMetaDto } from 'src/messages';
import { Equals, IsDefined, IsString, IsInt, ValidateNested} from 'class-validator';
import { Context } from 'telegraf';
import type { Message } from 'typegram'

export class FromTelegramMetaDto extends ToKafkaMetaDto {
    @IsString()
    @Equals('telegram')
    provider: 'telegram';

    /** Local telegram chat id, used only for telegram */
    @IsDefined()
    identity: number | string;

    /** Message id from telegram */
    @IsDefined()
    telegram_message_id: number | string;

    /** Unix time when message was send from user */
    @IsInt()
    timestamp: number

    constructor(ctx: Context) {
        super()
        this.identity = ctx.message.chat.id
        this.timestamp = ctx.message.date
        this.telegram_message_id = ctx.message.message_id
    }
}

export class FromTelegramMessageDto extends ToKafkaMessageDto {
    
    @ValidateNested()
    meta: FromTelegramMetaDto;

    @IsString()
    text: string;

    constructor(ctx: Context) {
        super()

        const message = ctx.message as Message.TextMessage

        this.meta = new FromTelegramMetaDto(ctx)
        this.text = message.text
    }
    
}

