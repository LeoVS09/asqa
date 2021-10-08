import { AnswerService } from './AnswerService';
import { RedisCacheService } from './RedisCacheService';

const ANSWER_URL = process.env.ANSWER_URL;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

describe('AnswerService', () => {
  console.log(`Redis host/port ${REDIS_HOST} ${REDIS_PORT}`);

  const redisCacheService: RedisCacheService = new RedisCacheService(
    REDIS_HOST,
    REDIS_PORT,
    'v1',
    () => console.log('Redis is ready'),
  );

  beforeAll(async () => {
    await redisCacheService.isReady();
    return await redisCacheService.clear();
  });

  afterAll(async () => {
    return await redisCacheService.shutdown();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get answers', () => {
    it('should return an array of answers', async () => {
      const answerer = new AnswerService(ANSWER_URL, redisCacheService);
      const isReady = await answerer.isReady();
      if (!isReady) {
        fail('AnswerService is not ready');
      }

      const result = await answerer.answer('some Question', 'some Context');
      expect(result).toEqual(['some Question', 'some Context']);
    });

    it('should return an answers from answer-service and save to cache', async () => {
      const answerer = new AnswerService(ANSWER_URL, redisCacheService);
      const isReady = await answerer.isReady();
      if (!isReady) {
        fail('AnswerService is not ready');
      }

      const question = 'some Question2';
      const context = 'some Context2';

      const cacheSpyGet = jest.spyOn(redisCacheService, 'get');
      const cacheSpySet = jest.spyOn(redisCacheService, 'set');
      const result = await answerer.answer(question, context);
      expect(result).toEqual([question, context]);

      expect(cacheSpyGet).toHaveBeenCalledTimes(1);
      expect(cacheSpySet).toHaveBeenCalledTimes(1);

      const cachedAnswer = await redisCacheService.get({ question, context });
      expect(JSON.parse(cachedAnswer)).toEqual([question, context]);
    });

    it('should return an array of answers from cache', async () => {
      const answerer = new AnswerService(ANSWER_URL, redisCacheService);
      const isReady = await answerer.isReady();
      if (!isReady) {
        fail('AnswerService is not ready');
      }

      const question = 'some Question2';
      const context = 'some Context2';

      const cacheSpyGet = jest.spyOn(redisCacheService, 'get');
      const cacheSpySet = jest.spyOn(redisCacheService, 'set');
      const result = await answerer.answer(question, context);
      expect(result).toEqual([question, context]);

      expect(cacheSpyGet).toHaveBeenCalledTimes(1);
      expect(cacheSpySet).toHaveBeenCalledTimes(0);
    });
  });
});
