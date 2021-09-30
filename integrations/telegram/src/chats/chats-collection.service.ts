import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatDto } from 'src/telegram';
import {ChatModel, ChatDocument} from './schemas'

@Injectable()
export class ChatsCollectionService {

    constructor(@InjectModel(ChatModel.name) private model: Model<ChatDocument>) {}

    async get(id: string | number): Promise<ChatDocument | undefined> {
        return await this.model.findById(id)
    }

    async save(data: ChatDto): Promise<ChatDocument> {
        const chat = new this.model({
            ...data,
            _id: data.id
        })
        return await chat.save()
    }

}
