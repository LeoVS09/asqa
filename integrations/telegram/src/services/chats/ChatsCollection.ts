import { Collection, WithId } from "mongodb";
import { ChatDto } from "../telegram";
import { MongoDbAdapter } from "../storage/MongoDB";
import { ISimpleStorage } from "src/interfaces";

export class ChatsCollection implements ISimpleStorage<ChatDto> {

    collection: Collection<ChatDto>

    constructor(
        private readonly db: MongoDbAdapter
    ){
        this.collection = this.db.collection('telegram-chats') as unknown as Collection<ChatDto>;
    }

    async get(id: number): Promise<ChatDto | undefined> {
        return await this.collection.findOne<ChatDto>({
            _id: id 
        })
    }

    async save(data: ChatDto) {
        return await this.collection.updateOne({
            ...data,
            _id: data.id as any
        } as WithId<ChatDto>, 
        {
            upsert: true
        })
    }
    
}