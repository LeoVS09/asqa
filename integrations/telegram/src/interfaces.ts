export interface HealthDependency {
    isReady(): Promise<boolean>;
    stop(): Promise<void>;
}
  
export interface IdentifaibleData {
    id: number
}

export interface IStorageService<T extends IdentifaibleData = IdentifaibleData> {
    saveIfNotExists(data: T): Promise<void>
}
