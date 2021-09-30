import { CACHE_MANAGER, Inject, Injectable, CacheStore } from '@nestjs/common';
import { ChatDto } from 'src/telegram';
import { ChatsCollectionService } from './chats-collection.service';
import { ChatDocument } from './schemas';

@Injectable()
export class CachedChatsCollectionService {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
        private readonly collection: ChatsCollectionService
    ) {}
    
    async get(id: string | number): Promise<ChatDto | undefined> {
        // TODO: replace with decorator
        const cached = await this.cacheManager.get<ChatDto>(`${id}`);
        if (cached)
            return cached
            
        const result = await this.collection.get(id)
        // Cache only on get for prevent cases 
        //  when data is cached but not saved in database
        if (result)
            await this.cacheManager.set(`${id}`, result.toObject());
        return result
    }

    async save(data: ChatDto): Promise<ChatDocument> {
        return await this.collection.save(data)
    }

}
