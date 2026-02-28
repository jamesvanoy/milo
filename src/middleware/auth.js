const jwt = require('jsonwebtoken');
const config = require('../config');
const { findById } = require('../data/store');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = findById('users', payload.sub);

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid user account' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
