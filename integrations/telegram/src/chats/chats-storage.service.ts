import { Injectable } from '@nestjs/common';
import { ChatDto } from 'src/telegram';
import { CachedChatsCollectionService } from './cached-chats-collection.service';

@Injectable()
export class ChatsStorageService {
    
    constructor(
        private readonly collection: CachedChatsCollectionService
    ){}

    async saveIfNotExists(data: ChatDto): Promise<void> {
        const existed = await this.collection.get(data.id)
        if(existed) 
            return
        
        await this.collection.save(data)
    }
    
}
