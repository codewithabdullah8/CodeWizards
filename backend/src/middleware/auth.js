const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;

  if (!t) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_change_me';
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not set — using fallback secret (dev only)');
  }

  try {
    const decoded = jwt.verify(t, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    // Distinguish expired tokens from other errors so client can react accordingly
    if (e.name === 'TokenExpiredError') {
      console.warn('JWT token expired for request');
      return res.status(401).json({ message: 'Token expired', tokenExpired: true, expiredAt: e.expiredAt });
    }

    console.error('JWT verify error:', e.name, e.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
