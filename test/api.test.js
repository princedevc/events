const request = require('supertest');
const createServer = require('../src/server');

describe('API integration', () => {
  let app;

  beforeAll(() => {
  app = createServer();
  const knex = require('../src/db');
  return knex.migrate.latest();
  });

  test('initialize endpoint', async () => {
    const res = await request(app).post('/initialize').send({ eventId: 'ev1', tickets: 2 });
    expect(res.status).toBe(200);
    expect(res.body.eventId).toBe('ev1');
  });

  test('book and cancel flow', async () => {
    await request(app).post('/initialize').send({ eventId: 'flow1', tickets: 1 });
    const b1 = await request(app).post('/book').send({ eventId: 'flow1', userId: 'u1' });
    expect(b1.body.assigned).toBe(true);
    const b2 = await request(app).post('/book').send({ eventId: 'flow1', userId: 'u2' });
    expect(b2.body.assigned).toBe(false);
    const c = await request(app).post('/cancel').send({ eventId: 'flow1', userId: 'u1' });
    expect(c.body.reassignedTo).toBe('u2');
    const s = await request(app).get('/status/flow1');
    expect(s.body.available).toBe(0);
  });

  afterAll(async () => {
    const knex = require('../src/db');
    await knex.destroy();
  });
});
