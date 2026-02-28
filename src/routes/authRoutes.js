const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { data, insert } = require('../data/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = data.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !user.active) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      role: user.role,
      email: user.email
    },
    config.jwtSecret,
    {
      subject: user.id,
      expiresIn: config.tokenTtl
    }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'employee' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const existing = data.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = insert('users', {
    name,
    email,
    passwordHash,
    role,
    active: true
  });

  return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
