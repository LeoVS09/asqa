import { ISimpleStorage } from "src/interfaces"
import { ChatData, IChatsStorage } from "../telegram"



export class ChatsStorage implements IChatsStorage {

    constructor(
        private readonly internalStorage: ISimpleStorage<ChatData>
    ){}

    async saveIfNotExists(data: ChatData): Promise<void> {
        const existed = await this.internalStorage.get(data.id)
        if(existed) 
            return
        
        return await this.internalStorage.save(data)
    }
}