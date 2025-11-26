const EventService = require('../src/service/eventService');

describe('EventService (unit)', () => {
  let svc;

  beforeAll(async () => {
    // run migrations so orders table exists in test DB
    const knex = require('../src/db');
    await knex.migrate.latest();
  });

  beforeEach(() => {
    svc = new EventService();
  });

  afterEach(async () => {
    const knex = require('../src/db');
    await knex('orders').del();
  });

  afterAll(async () => {
    const knex = require('../src/db');
    await knex.destroy();
  });

  test('initializes an event with tickets', () => {
    svc.initialize('e1', 2);
    const status = svc.status('e1');
    expect(status.available).toBe(2);
  });

  test('books a ticket when available', async () => {
    svc.initialize('e2', 1);
    const res = await svc.book('e2', 'user1');
    expect(res.assigned).toBe(true);
    const status = svc.status('e2');
    expect(status.available).toBe(0);
  });

  test('adds to waiting list when sold out', async () => {
    svc.initialize('e3', 1);
    await svc.book('e3', 'u1');
    const res = await svc.book('e3', 'u2');
    expect(res.assigned).toBe(false);
    const status = svc.status('e3');
    expect(status.waitingList).toBe(1);
  });

  test('cancels and assigns to waiting list', async () => {
    svc.initialize('e4', 1);
    await svc.book('e4', 'a');
    await svc.book('e4', 'b'); // b on waiting list
    const cancelRes = await svc.cancel('e4', 'a');
    expect(cancelRes.reassignedTo).toBe('b');
    const status = svc.status('e4');
    expect(status.available).toBe(0);
    expect(status.waitingList).toBe(0);
  });

  test('concurrent bookings respect capacity', async () => {
    const knex = require('../src/db');
    svc.initialize('e5', 5);
    const users = Array.from({ length: 10 }, (_, i) => `u${i}`);
    await Promise.all(users.map(u => svc.book('e5', u)));
    // check DB counts
    const booked = await knex('orders').where({ event_id: 'e5', status: 'booked' }).count('* as c');
    const waiting = await knex('orders').where({ event_id: 'e5', status: 'waiting' }).count('* as c');
    expect(Number(booked[0].c)).toBe(5);
    expect(Number(waiting[0].c)).toBe(5);
  });
});
