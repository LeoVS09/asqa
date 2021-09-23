import { Telegraf } from 'telegraf';
import { IMessageBroker } from "../../retranslator";
import { CommonMessage, HealthDependency } from 'src/interfaces';
import { ChatDto } from './ChatDto';
import { TelegramMessageDto, TelegramMetaDto } from './TelegramMessageDto';

const telegramKey = process.env.TELEGRAM_BOT_API_KEY
if (!telegramKey) 
  throw new Error('Cannot find environment variable: TELEGRAM_BOT_API_KEY')

export type HelloMessageCallback = () => Promise<string>

export interface IServiceMesssagesService {
    getHello(): Promise<string>
}

export interface IChatsStorage {
    saveIfNotExists(data: ChatDto): Promise<void>
}

export class TelegramAdapter implements IMessageBroker, HealthDependency {

    bot: Telegraf
    
    private isStarted: boolean = false

    constructor(
        private readonly messageService: IServiceMesssagesService,
        private readonly storage: IChatsStorage
    ) {

        this.bot = new Telegraf(telegramKey);

        this.bot.start(async (ctx) => {
            
            const saving = this.storage.saveIfNotExists(new ChatDto(ctx))

            ctx.reply(await this.messageService.getHello())

            await saving
        });
    }

    async start(){
        await this.bot.launch(); // Currently using long polling
        // TODO: swith to webhook
        
        this.isStarted = true
    }

    async stop() {
        this.isStarted = false;
        this.bot.stop('Shutdown signal received');
    }

    async isReady(): Promise<boolean> {
        // TODO: add real health check
        return this.isStarted
    }

    on(callback: (message: CommonMessage<TelegramMetaDto>) => void) {
        this.bot.on('text', async (ctx) => {
            await this.storage.saveIfNotExists(new ChatDto(ctx))
        
            callback(new TelegramMessageDto(ctx));
        });
    }

    send({meta, text}: CommonMessage<TelegramMetaDto>) {
        if (meta.provider !== 'telegram') 
            throw new Error('Received message not for telegram')
        
        const id = +meta.identity
        if (!id || typeof id !== 'number' || isNaN(id)) 
            throw new Error(`Message meta not have identity: ${meta.identity}`)
        
        this.bot.telegram.sendMessage(id, text)
    }
}