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

// TODO: switch to database
const contextCache: { [key: string]: Context } = {};

const HELLO_MESSAGE =
  'Hello! ' +
  'This AI know everything, just ask what you want to know. \n' +
  'For example: Why sky is blue?\n\n' +
  'Disclaimer: We in early alpha, ' +
  'but really want to give all people ability to get answers on any questions instantly.\n' +
  'Let us know if something work incorrectly or you have ideas what we can improve. ' +
  'You can write us directly, asqa-team@protonmail.com.';

async function bootstrap() {
  const kafka = await connectKafka();

  const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

  bot.start((ctx) => ctx.reply(HELLO_MESSAGE));

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
