import * as express from 'express';
import * as http from 'http';
import { Retranslator } from './retranslator'
import {
  CachableStorage,
  InMemoryCache,
  KafkaAdapter,
  MongoDbAdapter,
  setupHealthCheck,
  StorageAdapter,
  TelegramAdapter,
  WEEK_EXPIRATION
} from './services';

import { MessagesService } from './messages';

const port = process.env.SERVER_PORT || 3000

const MONGODB_USERS_COLLECTION = 'telegram-users';

// TODO: Rewrite to Nest
async function setup(){
  const kafka = new KafkaAdapter();

  const messagesService = new MessagesService();
  
  const mongoDb = new MongoDbAdapter(MONGODB_USERS_COLLECTION);
  const cache = new InMemoryCache(WEEK_EXPIRATION);
  const cachableStorage = new CachableStorage(cache, mongoDb);
  const storage = new StorageAdapter(cachableStorage)

  const telegram = new TelegramAdapter(messagesService, storage)

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
