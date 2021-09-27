import { Module, CacheModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {ChatModel, ChatSchema} from './schemas'
import { ChatsStorageService } from './chats-storage.service';
import { ChatsCollectionService } from './chats-collection.service';
import { CachedChatsCollectionService } from './cached-chats-collection.service';


@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('ChatsCacheModule')

        const configuration = {
          ttl: +configService.get('CHATS_CACHE_TTL'),
          max: +configService.get('CHATS_CACHE_MAX_COUNT'),
        }

        logger.log(`Configuration ${JSON.stringify(configuration)}`)
        
        return configuration
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: ChatModel.name, schema: ChatSchema }])
  ],
  providers: [ChatsStorageService, ChatsCollectionService, CachedChatsCollectionService],
  exports: [ChatsStorageService]
})
export class ChatsModule {}
