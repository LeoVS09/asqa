import { Telegraf, Context } from 'telegraf';
import {
  stopKafka,
  consumeKafkaMessages,
  sendMessageToKafka,
  connectKafka,
} from './kafka';
import * as express from 'express';
import * as http from 'http';
import { addHealthCheck } from './health';
import { MessagesService } from './messages';

// TODO: switch to database
const contextCache: { [key: string]: Context } = {};

const telegramKey = process.env.TELEGRAM_BOT_API_KEY
if (!telegramKey) 
  throw new Error('Cannot find environment variable: TELEGRAM_BOT_API_KEY')

async function bootstrap() {
  const kafka = await connectKafka();

  const bot = new Telegraf(telegramKey);

  const messagesService = new MessagesService();
  
  bot.start(async (ctx) => ctx.reply(await messagesService.getHello()));

  bot.on('text', (ctx) => {
    const identity = String(ctx.message.chat.id);

    contextCache[identity] = ctx;

    sendMessageToKafka({
      meta: { identity },
      text: ctx.message.text,
    });
  });

  await bot.launch(); // Currently using long polling
  // TODO: swith to webhook

  await consumeKafkaMessages(async ({ meta, text }) => {
    contextCache[meta.identity]?.reply(text);
  });

  const app = express();
  app.get('/', (req, res) => {
    res.send('ok');
  });

  const server = http.createServer(app);

  addHealthCheck(server, {
    isReady: async () => {
      // TODO: make real ready check
      return !!(bot && kafka.consumer && kafka.producer);
    },
    onShutdownSignal: async () => {
      bot.stop('Shutdown signal received');
      await stopKafka();
      await new Promise<void>((resolve, reject) =>
        server.close((err) => {
          if (err) reject(err);
          resolve();
        }),
      );
    },
  });

  const port = process.env.SERVER_PORT || 3000;
  console.log('Will start server at port ' + port);

  server.listen(port);
}
bootstrap();
