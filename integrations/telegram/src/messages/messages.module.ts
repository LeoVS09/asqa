import { Module } from '@nestjs/common';
import { MessagesService } from './messages/messages.service';

@Module({
  providers: [MessagesService],
  exports: [MessagesService]
})
export class MessagesModule {}
