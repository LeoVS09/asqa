import { DependencyService } from './DependencyService';
import * as redis from 'redis';

const REDIS_DEFAULT_TTL = +(
  process.env.REDIS_DEFAULT_TTL || 60 * 60 * 24 * 7 * 4
);

export class RedisCacheService extends DependencyService {
  private readonly redisClient: redis.RedisClient;
  private isClientReady: boolean;

  constructor(
    private readonly host: string,
    private readonly port: number | string,
    private readonly version: string,
    readyCallback?: () => void,
  ) {
    super();

    this.redisClient = redis.createClient(+this.port, this.host);
    this.isClientReady = false;

    this.redisClient.on('ready', () => {
      this.isClientReady = true;
      readyCallback?.();
    });

    this.redisClient.on('warning', console.warn);
    this.redisClient.on('error', console.error);
  }

  public clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.flushall('ASYNC', (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  public shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.quit((err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  public set(key: any, value: string): Promise<void> {
    if (!this.isReady) {
      return Promise.resolve();
    }

    key = this.getKey(key);
    return new Promise((resolve, reject) => {
      this.redisClient.setex(key, REDIS_DEFAULT_TTL, value, (err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  public get(key: any): Promise<string | null> {
    if (!this.isReady) {
      return Promise.resolve(null);
    }

    key = this.getKey(key);
    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (err, reply) => {
        if (err) {
          return reject(err);
        }
        try {
          this.redisClient.expire(key, REDIS_DEFAULT_TTL, (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(reply);
          });
        } catch (e) {
          return reject(err);
        }
      });
    });
  }

  async isReady() {
    return this.isClientReady;
  }

  private getKey(key: any) {
    const keyString = JSON.stringify({ key });
    return this.version + '_' + hash(keyString);
  }
}

function hash(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
