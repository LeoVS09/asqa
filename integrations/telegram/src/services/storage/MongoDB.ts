import { HealthDependency } from "src/interfaces";
import { Db, MongoClient } from 'mongodb'

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

export class MongoDbAdapter implements HealthDependency {

    client: MongoClient
    db: Db;
    

    areWasConnect: boolean = false;

    constructor() {

        const {url, dbName} = extractMongoDBConfiguration()

        this.client = new MongoClient(url);
        this.db = this.client.db(dbName)
        
    }

    public collection(name: string) {
        return this.db.collection(name);
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


    
}