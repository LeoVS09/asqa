import * as express from 'express';
import * as http from 'http';
import { Retranslator } from './retranslator'
import {
  KafkaAdapter,
  setupHealthCheck,
  TelegramAdapter
} from './services';

import { MessagesService } from './messages';

const port = process.env.SERVER_PORT || 3000

async function setup(){
  const kafka = new KafkaAdapter();

  const messagesService = new MessagesService();
  const telegram = new TelegramAdapter(messagesService)

  const retranslator = new Retranslator([telegram, kafka]);

  retranslator.start()
  await kafka.connect();
  telegram.start()

  return [telegram, kafka]
}

async function bootstrap() {
  const dependencies = await setup()

  const app = express();
  app.get('/', (req, res) => res.send('ok'));

  const server = http.createServer(app);
  setupHealthCheck({server, dependencies})

  console.log('Will start server at port ' + port);
  server.listen(port);
}

bootstrap();
