import { Telegraf, Context } from 'telegraf';
import type {Chat, User} from 'typegram'
import { IMessageBroker, Message } from "../retranslator";
import { HealthDependency, IdentifaibleData } from 'src/interfaces';

const telegramKey = process.env.TELEGRAM_BOT_API_KEY
if (!telegramKey) 
  throw new Error('Cannot find environment variable: TELEGRAM_BOT_API_KEY')

export type HelloMessageCallback = () => Promise<string>

export interface TelegramMeta {
    /** Local telegram id, used only for telegram */
    identity: string;
    provider: 'telegram';
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

export interface IChatsStorage {
    saveIfNotExists(data: ChatData): Promise<void>
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

    on(callback: (message: Message<TelegramMeta>) => void) {
        this.bot.on('text', async (ctx) => {
            await this.saveIfNotExists(ctx)
        
            callback({
                meta: { 
                  identity: String(ctx.message.chat.id),
                  provider: 'telegram',
                },
                text: ctx.message.text,
            });
        });
    }

    send({meta, text}: Message<TelegramMeta>) {
        if (meta.provider !== 'telegram') 
            throw new Error('Received message not for telegram')
        
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