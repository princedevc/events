const { Mutex } = require('async-mutex');
const knex = require('../db');
const logger = require('../logger');

class EventService {
  constructor() {
    this.events = new Map(); // eventId -> { total, available, bookings: Set(userId), waiting: [] }
    this.mutexes = new Map();
  }

  _getMutex(eventId) {
    if (!this.mutexes.has(eventId)) this.mutexes.set(eventId, new Mutex());
    return this.mutexes.get(eventId);
  }

  initialize(eventId, tickets) {
    if (!eventId || typeof tickets !== 'number' || tickets < 0) throw new Error('Invalid params');
    this.events.set(eventId, { total: tickets, available: tickets, bookings: new Set(), waiting: [] });
  logger.info({ eventId, tickets }, 'event initialized');
  }

  status(eventId) {
    const ev = this.events.get(eventId);
    if (!ev) throw new Error('Event not found');
    return { eventId, total: ev.total, available: ev.available, waitingList: ev.waiting.length };
  }

  async book(eventId, userId) {
    if (!userId) throw new Error('Invalid user');
    const ev = this.events.get(eventId);
    if (!ev) throw new Error('Event not found');

    const mutex = this._getMutex(eventId);
    return await mutex.runExclusive(async () => {
  logger.debug({ eventId, userId }, 'book attempt');
      if (ev.bookings.has(userId)) return { assigned: true, message: 'Already booked' };

      if (ev.available > 0) {
        ev.available -= 1;
        ev.bookings.add(userId);
        // persist order
        await knex('orders').insert({ event_id: eventId, user_id: userId, status: 'booked' });
  logger.info({ eventId, userId }, 'ticket assigned');
        return { assigned: true };
      } else {
        ev.waiting.push(userId);
        await knex('orders').insert({ event_id: eventId, user_id: userId, status: 'waiting' });
  logger.info({ eventId, userId }, 'added to waiting list');
        return { assigned: false };
      }
    });
  }

  async cancel(eventId, userId) {
    const ev = this.events.get(eventId);
    if (!ev) throw new Error('Event not found');
    const mutex = this._getMutex(eventId);
    return await mutex.runExclusive(async () => {
  logger.debug({ eventId, userId }, 'cancel attempt');
      let reassignedTo = null;

      if (ev.bookings.has(userId)) {
        ev.bookings.delete(userId);
        ev.available += 1;
  await knex('orders').where({ event_id: eventId, user_id: userId, status: 'booked' }).update({ status: 'cancelled' });
  logger.info({ eventId, userId }, 'booking cancelled');

        if (ev.waiting.length > 0) {
          const next = ev.waiting.shift();
          ev.bookings.add(next);
          ev.available -= 1;
          reassignedTo = next;
          await knex('orders').where({ event_id: eventId, user_id: next, status: 'waiting' }).update({ status: 'booked' });
          logger.info({ eventId, reassignedTo: next }, 'reassigned ticket from cancel');
        }
      } else {
        // user might be on waiting list
        const idx = ev.waiting.indexOf(userId);
        if (idx !== -1) {
          ev.waiting.splice(idx, 1);
          await knex('orders').where({ event_id: eventId, user_id: userId, status: 'waiting' }).update({ status: 'cancelled' });
          logger.info({ eventId, userId }, 'waiting-list entry cancelled');
        } else {
          throw new Error('No booking or waiting entry for user');
        }
      }

      return { reassignedTo };
    });
  }
}

module.exports = EventService;
