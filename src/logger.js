const pino = require('pino');

const isTest = process.env.NODE_ENV === 'test';

const logger = pino({
  level: isTest ? 'silent' : (process.env.LOG_LEVEL || 'info'),
  transport: isTest ? undefined : { target: 'pino-pretty' }
});

module.exports = logger;
