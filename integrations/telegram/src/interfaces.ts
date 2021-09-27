export interface HealthDependency {
    isReady(): Promise<boolean>;
    stop(): Promise<void>;
}
  
export interface IdentifaibleData {
    id: string | number
}


export interface ISimpleStorage<T extends IdentifaibleData = IdentifaibleData> {
    get(id: number): Promise<T | undefined>;
    save(data: T)
}