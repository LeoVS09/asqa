import { HealthDependency, IdentifaibleData } from "src/interfaces";
import { ISimpleStorageService } from "./adapter";
import { Collection, Db, MongoClient, Filter, WithId} from 'mongodb'

export function extractMongoDBConfiguration(){
    const {MONGODB_URL: url} = process.env;
    if(!url)
        throw new Error('Cannot find MONGODB_URL environment variable');
    console.log('Will connect to mongodb: ', url)

    const {MONGODB_DATABASE_NAME: dbName} = process.env;
    if(!dbName) 
        throw new Error('Cannot find MONGODB_DATABASE_NAME environment variable')
    console.log('Will use mongodb database name: ', dbName)
    
    return {url, dbName};
}

export class MongoDbAdapter<T extends IdentifaibleData = IdentifaibleData> implements ISimpleStorageService<T>, HealthDependency {

    client: MongoClient
    db: Db;
    collection: Collection<WithId<T>>

    areWasConnect: boolean = false;

    constructor(
        private readonly collectionName: string,
    ) {

        const {url, dbName} = extractMongoDBConfiguration()

        this.client = new MongoClient(url);
        this.db = this.client.db(dbName)
        this.collection = this.db.collection(this.collectionName);
    }

    public async connect(): Promise<MongoClient> {
        const result = await this.client.connect();

        this.areWasConnect = true

        return result
    }

    public async stop(): Promise<void> {
        this.areWasConnect = false
        await this.client.close()
    }

    async isReady(): Promise<boolean> {
        // TODO: add rea health check
        return this.areWasConnect
    }

    async get(id: number): Promise<T | undefined> {
        return await this.collection.findOne<T>({
            _id: id 
        } as Filter<WithId<T>>)
    }

    async save(data: T) {
        return await this.collection.updateOne({
            ...data,
            _id: data.id as any
        } as WithId<T>, 
        {
            upsert: true
        })
    }
    
}