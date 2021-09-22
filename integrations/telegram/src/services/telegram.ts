import { Telegraf, Context } from 'telegraf';
import type {Chat, User} from 'typegram'
import { IMessageBroker, Message } from "../retranslator";
import { HealthDependency, IdentifaibleData, IStorageService } from 'src/interfaces';

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


/** Can be conversation with user or group */
export interface ChatData extends IdentifaibleData {
    id: number;
    chat: Chat
    from: User
}
export class TelegramAdapter implements IMessageBroker, HealthDependency {

    bot: Telegraf
    
    private isStarted: boolean = false

    constructor(
        private readonly messageService: IServiceMesssagesService,
        private readonly storage: IStorageService<ChatData>
    ) {

        this.bot = new Telegraf(telegramKey);

        this.bot.start(async (ctx) => {
            
            const saving = this.saveIfNotExists(ctx)

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

    on(callback: (message: Message<MetaWithIdentity>) => void) {
        this.bot.on('text', async (ctx) => {
            await this.saveIfNotExists(ctx)
            
            const identity = String(ctx.message.chat.id);
        
            callback({
              meta: { identity },
              text: ctx.message.text,
            });
        });
    }

    send({meta, text}: Message<MetaWithIdentity>) {
        const id = +meta.identity
        if (!id || typeof id !== 'number' || isNaN(id)) 
            throw new Error(`Message meta not have identity: ${meta.identity}`)
        
        this.bot.telegram.sendMessage(id, text)
    }

    private async saveIfNotExists({message: {chat, from}}: Context) {
        return await this.storage.saveIfNotExists({
            id: chat.id,
            chat,
            from
        })
    }
}