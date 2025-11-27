const express = require('express');
const EventService = require('./service/eventService');
const knex = require('./db');
const rateLimit = require('express-rate-limit');
const logger = require('./logger');

function createServer() {
  const app = express();
  app.use(express.json());
  // simple request logger
  app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url, body: req.body }, 'incoming request');
    next();
  });
  // apply a simple global rate limiter in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use(limiter);
  }

  const { generateToken, tokenMiddleware } = require('./auth');
  // keep basic auth helper for token exchange
  function basicAuthCheck(user, pass) {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'password';
    return user === adminUser && pass === adminPass;
  }
  const svc = new EventService();

  app.post('/initialize', tokenMiddleware, async (req, res) => {
    try {
      const { eventId, tickets } = req.body;
      svc.initialize(eventId, tickets);
      // ensure orders table exists in DB
      res.json({ eventId, tickets });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/book', async (req, res) => {
    try {
      const { eventId, userId } = req.body;
      const result = await svc.book(eventId, userId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/cancel', tokenMiddleware, async (req, res) => {
    try {
      const { eventId, userId } = req.body;
      const result = await svc.cancel(eventId, userId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });


  app.get('/status/:eventId', (req, res) => {
    try {
      const status = svc.status(req.params.eventId);
      res.json(status);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  // health
  app.get('/health', (req, res) => res.json({ ok: true }));

  // root landing page - redirect to UI
  app.get('/', (req, res) => {
    res.redirect('/ui/');
  });

  // serve frontend UI
  const path = require('path');
  app.use('/ui', express.static(path.join(__dirname, 'public')));

  // token exchange: POST /auth/token with Basic Auth to receive JWT
  app.post('/auth/token', (req, res) => {
    if (process.env.NODE_ENV === 'test') return res.status(200).json({ token: generateToken({ admin: true }) });
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) return res.status(401).json({ error: 'Unauthorized' });
    const creds = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const [user, pass] = creds.split(':');
    if (!basicAuthCheck(user, pass)) return res.status(401).json({ error: 'Unauthorized' });
    const token = generateToken({ admin: true, user });
    res.json({ token });
  });

  return app;
}

if (require.main === module) {
  const app = createServer();
  const port = process.env.PORT || 3000;
  // run migrations
  knex.migrate.latest().then(() => {
    app.listen(port, () => console.log(`Server listening on ${port}`));
  });
}

module.exports = createServer;
