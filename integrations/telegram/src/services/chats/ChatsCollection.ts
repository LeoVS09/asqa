import { Collection, WithId } from "mongodb";
import { ChatData } from "../telegram";
import { MongoDbAdapter } from "../storage/MongoDB";
import { ISimpleStorage } from "src/interfaces";

export class ChatsCollection implements ISimpleStorage<ChatData> {

    collection: Collection<ChatData>

    constructor(
        private readonly db: MongoDbAdapter
    ){
        this.collection = this.db.collection('telegram-chats') as unknown as Collection<ChatData>;
    }

    async get(id: number): Promise<ChatData | undefined> {
        return await this.collection.findOne<ChatData>({
            _id: id 
        })
    }

    async save(data: ChatData) {
        return await this.collection.updateOne({
            ...data,
            _id: data.id as any
        } as WithId<ChatData>, 
        {
            upsert: true
        })
    }
    
}