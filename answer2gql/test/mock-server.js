/* eslint-disable @typescript-eslint/no-var-requires */
const fastify = require('fastify')({
  logger: false,
});

fastify.get('/healthz', (request, reply) => {
  reply
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send({ ok: true });
});

fastify.post('/predict', (request, reply) => {
  const { question, context } = JSON.parse(request.body || {});
  reply
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send([question, context]);
});

fastify.listen(8904, '0.0.0.0', (err, address) => {
  if (err) throw err;
  console.log('Mock is running on: ' + address);
});
