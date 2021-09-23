import { IdentifaibleData, ISimpleStorage } from "src/interfaces";

export class CachableStorage<T extends IdentifaibleData = IdentifaibleData> implements ISimpleStorage<T> {

    constructor(
        private readonly cache: ISimpleStorage<T>,
        private readonly persistent: ISimpleStorage<T>,
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