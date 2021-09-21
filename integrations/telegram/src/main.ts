import { Telegraf, Context } from 'telegraf';
import {
  KafkaAdapter,
  extractKafkaEnvironmentVariables,
  addHealthCheck
} from './services';
import * as express from 'express';
import * as http from 'http';
import { MessagesService } from './messages';

// TODO: switch to database
const contextCache: { [key: string]: Context } = {};

const telegramKey = process.env.TELEGRAM_BOT_API_KEY
if (!telegramKey) 
  throw new Error('Cannot find environment variable: TELEGRAM_BOT_API_KEY')

const port = process.env.SERVER_PORT || 3000

const kafkaOptions = extractKafkaEnvironmentVariables()

async function bootstrap() {
  const kafka = new KafkaAdapter(kafkaOptions);
  await kafka.connect();

  const bot = new Telegraf(telegramKey);

  const messagesService = new MessagesService();
  
  bot.start(async (ctx) => ctx.reply(await messagesService.getHello()));

  bot.on('text', (ctx) => {
    const identity = String(ctx.message.chat.id);

    contextCache[identity] = ctx;

    kafka.sendFromUserMessage({
      meta: { identity },
      text: ctx.message.text,
    });
  });

  await bot.launch(); // Currently using long polling
  // TODO: swith to webhook

  await kafka.onToUserMessage(async ({ meta, text }) => {
    const ctx = contextCache[meta.identity]
    if(!ctx) {
      console.error(`Cannot find context with identity: ${meta.identity} for send message: ${ctx.message}`);
      return
    }
    
    ctx.reply(text);
  });

  const app = express();
  app.get('/', (req, res) => {
    res.send('ok');
  });

  const server = http.createServer(app);

  addHealthCheck(server, {
    isReady: async () => {
      // TODO: make real ready check
      return !!(bot && kafka.isReady());
    },
    onShutdownSignal: async () => {
      bot.stop('Shutdown signal received');
      await kafka.stop();

      await new Promise<void>((resolve, reject) =>
        server.close((err) => {
          if (err) reject(err);
          resolve();
        }),
      );
    },
  });

  console.log('Will start server at port ' + port);
  server.listen(port);
}
bootstrap();
