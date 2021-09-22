import { IdentifaibleData, IStorageService } from "src/interfaces"

export interface ISimpleStorageService<T extends IdentifaibleData = IdentifaibleData> {
    get(id: number): Promise<T | undefined>;
    save(data: T)
}

export class StorageAdapter<T extends IdentifaibleData = IdentifaibleData> implements IStorageService<T> {

    constructor(
        private readonly internalStorage: ISimpleStorageService
    ){}

    async saveIfNotExists(data) {
        const existed = await this.internalStorage.get(data.id)
        if(existed) 
            return
        
        return await this.internalStorage.save(data)
    }
}