import { CACHE_MANAGER, Inject, Injectable, CacheStore } from '@nestjs/common';
import { ChatDto } from 'src/telegram';
import { ChatsCollectionService } from './chats-collection.service';

@Injectable()
export class CachedChatsCollectionService {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
        private readonly collection: ChatsCollectionService
    ) {}
    
    async get(id: string | number): Promise<ChatDto> {
        // TODO: replace with decorator
        const value = await this.cacheManager.get<ChatDto>(`${id}`);
        if (value)
            return value
            
        return await this.collection.get(id)
    }

    async save(data: ChatDto): Promise<void> {
        await this.cacheManager.set(`${data.id}`, data);
        await this.collection.save(data)
    }

}
