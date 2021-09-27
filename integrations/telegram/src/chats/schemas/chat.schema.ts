import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChatDto } from 'src/telegram';
import { Chat, User } from 'typegram';

export type ChatDocument = ChatModel & Document;

@Schema({
    collection: 'chats',
    timestamps: true,
})
export class ChatModel implements ChatDto {
  @Prop({ type: String, required: true })
  _id: string | number;
  
  @Prop({ type: String, required: true })
  id: string | number;

  @Prop({ type: {}})
  chat: Chat;

  @Prop({ type: {}})
  from: User;
}

export const ChatSchema = SchemaFactory.createForClass(ChatModel);