import { Message } from 'src/retranslator';
import { KafkaAdapter } from './../src/services';

const timeout = time => new Promise(resolve => setTimeout(resolve, time))

jest.setTimeout(30000);

describe('Kafka (e2e)', () => {
  let kafka: KafkaAdapter;

  beforeAll(async () => {
    kafka = new KafkaAdapter();
    await kafka.connect()
  });

  it('Ask question', async () => {
    const answerPromise = new Promise(resolve => kafka.on(message => {
      resolve(message);
    }))

    kafka.send({
      meta: { identity: 'test'},
      text: 'What software tests made for?'
    })

    const answer = await answerPromise as Message
    console.log('Answer from Kafka:', answer)

    expect(answer.meta.identity).toBe('test')
    expect(answer.text).toBeDefined();
  });
});
