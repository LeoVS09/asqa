import { Test, TestingModule } from '@nestjs/testing';
import { Answer, Passages, PlatformApiService, TextTypes } from '../interfaces';
import { PlatformApiAdapterService } from '../platform-api-adapter/platform-api-adapter.service';
import { AnswererService } from './answerer.service';



describe('AnswererService', () => {
  let service: AnswererService;
  let mockPlatformApi: PlatformApiService 

  beforeEach(async () => {

    mockPlatformApi = {
      searchPassages(question: string): Promise<Passages[]> {
        throw new Error('Method not implemented.');
      },
      predictAnswers(question: string, context: string): Promise<Answer[]> {
          throw new Error('Method not implemented.');
      },
      generateText(type: TextTypes): Promise<string> {
          throw new Error('Method not implemented.');
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PlatformApiAdapterService,
          useValue: mockPlatformApi,
        },
        AnswererService
      ],
    }).compile();

    service = module.get<AnswererService>(AnswererService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generate answer on question', async () => {
    const question = "Where are we from?"
    const passages: Array<Passages> = ['Some text about question', 'Some other text about question', 'Some third text about question']
      .map((text, id) => ({id: `${id}`, text}))

    const answers: Array<Answer> = ['From the moon', 'From the heart', 'Yeah!']
      .map((text, i) => ({text, score: 30 - i}))

    const searchPassages = jest.fn(q => Promise.resolve(passages))
    const predictAnswers = jest.fn((q, con) => Promise.resolve(answers))
    mockPlatformApi.searchPassages = searchPassages
    mockPlatformApi.predictAnswers = predictAnswers

    const answer = await service.answer(question)

    expect(searchPassages.mock.calls.length).toBe(1)
    expect(searchPassages.mock.calls[0][0]).toBe(question);

    expect(predictAnswers.mock.calls.length).toBe(1)
    expect(predictAnswers.mock.calls[0][0]).toBe(question)
    expect(predictAnswers.mock.calls[0][1]).toBe("<P> " + passages.map(({ text }) => text).join(" <P> "))

    expect(answers.map(({ text }) => text)).toContain(answer)

  })
});
