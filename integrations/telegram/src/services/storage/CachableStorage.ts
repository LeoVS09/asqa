import { IdentifaibleData } from "src/interfaces";
import { ISimpleStorageService } from "./adapter";

export class CachableStorage<T extends IdentifaibleData = IdentifaibleData> implements ISimpleStorageService<T> {

    constructor(
        private readonly cache: ISimpleStorageService<T>,
        private readonly persistent: ISimpleStorageService<T>,
    ) {}

    async get(id: number): Promise<T | undefined> {
        let result = await this.cache.get(id)
        if (result) 
            return result;
        
        return await this.persistent.get(id)
    }

    save(data: T) {
        Promise.all([
            this.cache.save(data),
            this.persistent.save(data)
        ])
    }

}