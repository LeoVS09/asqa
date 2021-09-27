import { Module } from '@nestjs/common';

import { TelegramController } from './telegram/telegram.controller';
import { TelegrafProviderService } from './telegraf-provider/telegraf-provider.service';
import { TelegramService } from './telegram/telegram.service';
import { MessagesModule } from 'src/messages/messages.module';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
  imports: [MessagesModule, ChatsModule],
  controllers: [TelegramController],
  providers: [TelegrafProviderService, TelegramService]
})
export class TelegramModule {}
