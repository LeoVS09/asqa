import { Telegraf, Context } from 'telegraf';
import { IMessageBroker, Message } from "../retranslator";

const telegramKey = process.env.TELEGRAM_BOT_API_KEY
if (!telegramKey) 
  throw new Error('Cannot find environment variable: TELEGRAM_BOT_API_KEY')

export type HelloMessageCallback = () => Promise<string>

export interface MetaWithIdentity {
    identity: string;
}

export interface IServiceMesssagesService {
    getHello(): Promise<string>
}

export class TelegramAdapter implements IMessageBroker {

    bot: Telegraf
    contextCache: { [key: string]: Context }
    
    private isStarted: boolean = false

    constructor(private readonly messageService: IServiceMesssagesService) {

        this.bot = new Telegraf(telegramKey);

        this.bot.start(async (ctx) =>
            ctx.reply(await this.messageService.getHello())
        );

        // TODO: switch to database
        this.contextCache = {};
    }

    async start(){
        await this.bot.launch(); // Currently using long polling
        // TODO: swith to webhook
        
        this.isStarted = true
    }

    stop() {
        this.isStarted = false;
        this.bot.stop('Shutdown signal received');
    }

    isReady(): boolean {
        // TODO: add real health check
        return this.isStarted
    }

    on(callback: (message: Message<MetaWithIdentity>) => void) {
        this.bot.on('text', (ctx) => {
            const identity = String(ctx.message.chat.id);
        
            this.contextCache[identity] = ctx;
        
            callback({
              meta: { identity },
              text: ctx.message.text,
            });
        });
    }

    send({meta, text}: Message<MetaWithIdentity>) {
        if (!meta.identity) 
            throw new Error(`Message meta not have identity: ${meta.identity}`)
        
        const ctx = this.contextCache[meta.identity]
        if(!ctx) 
            throw new Error(`Cannot find context with identity: ${meta.identity} for send message: ${ctx.message}`);
        
        ctx.reply(text);
    }

}