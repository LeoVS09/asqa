import { KafkaAdapter } from './../src/services';

const timeout = time => new Promise(resolve => setTimeout(resolve, time))

describe('Kafka (e2e)', () => {
  let kafka: KafkaAdapter;

  beforeAll(async () => {
    kafka = new KafkaAdapter();
    await kafka.connect()
  });

  it('push message', async () => {
    kafka.send({
      meta: { identity: 'test'},
      text: 'This is a test message from Telegram service'
    })

    await timeout(1000)

  });
});
