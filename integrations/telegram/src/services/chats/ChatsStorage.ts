import { ISimpleStorage } from "src/interfaces"
import { ChatDto, IChatsStorage } from "../telegram"



export class ChatsStorage implements IChatsStorage {

    constructor(
        private readonly internalStorage: ISimpleStorage<ChatDto>
    ){}

    async saveIfNotExists(data: ChatDto): Promise<void> {
        const existed = await this.internalStorage.get(data.id)
        if(existed) 
            return
        
        return await this.internalStorage.save(data)
    }
}