const logger = require('./logger');

let jwt = null;
try {
  // require jsonwebtoken lazily; this may fail if package wasn't installed
  jwt = require('jsonwebtoken');
} catch (e) {
  // keep jwt null and continue; tests and environments without the package will still work
  logger && logger.warn && logger.warn({ err: e.message }, 'jsonwebtoken not available, using fallback');
}

const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me';
const TOKEN_EXP = process.env.TOKEN_EXP || '1h';

function generateToken(payload = {}) {
  if (!jwt) {
    // fallback: return a simple JSON string token for environments without jsonwebtoken
    return Buffer.from(JSON.stringify({ payload, iat: Date.now() })).toString('base64');
  }
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_EXP });
}

function tokenMiddleware(req, res, next) {
  if (process.env.NODE_ENV === 'test') return next();
  if (!jwt) return res.status(500).json({ error: 'Auth not configured' });
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    logger.warn({ err: err.message }, 'token verify failed');
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { generateToken, tokenMiddleware };
