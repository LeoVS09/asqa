import { Telegraf, Context } from 'telegraf';
import { createKafkaConsumer, sendMessageToKafka } from './kafka';

const contextCache: { [key: string]: Context } = {};

async function bootstrap() {
  const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

  handleExitEvents(bot);

  bot.start((ctx) => ctx.reply('Hello there! What do you want to know?'));

  bot.on('text', (ctx) => {
    const identity = String(ctx.message.chat.id);

    contextCache[identity] = ctx;

    sendMessageToKafka({
      identity,
      text: ctx.message.text,
    });
  });

  await bot.launch();

  await createKafkaConsumer(async ({ identity, text }) => {
    contextCache[identity]?.reply(text);
  });
}
bootstrap();

function handleExitEvents(bot: Telegraf) {
  ['unhandledRejection', 'uncaughtException'].map((type) => {
    process.on(type, (e) => {
      bot.stop(`[${type}]: ${e}`);
    });
  });

  ['SIGTERM', 'SIGINT', 'SIGUSR2'].map((type) => {
    process.once(type, async () => {
      bot.stop(type);
    });
  });
}
