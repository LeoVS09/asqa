import { DependencyService } from './DependencyService';
import fetch from 'node-fetch';
import { RedisCacheService } from './RedisCacheService';

export class AnswerService extends DependencyService {
  constructor(
    private readonly url: string,
    private readonly redisCache: RedisCacheService,
  ) {
    super();
  }

  async isReady() {
    const { status } = await fetch(this.url + '/healthz');
    return status === 200;
  }

  async answer(question: string, context: string): Promise<Array<string>> {
    const cacheKey = { question, context };
    if (await this.redisCache.isReady()) {
      const cached = await this.redisCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const response = await fetch(this.url + '/predict', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });

    const result = await response.json();

    const cacheValue = JSON.stringify(result);
    this.redisCache.set(cacheKey, cacheValue);

    return result;
  }
}
