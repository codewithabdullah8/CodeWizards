const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = name && name.trim();
    email = email && email.trim().toLowerCase();
    password = password || '';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });

    // Sign token using configurable expiry
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_change_me';
    if (!process.env.JWT_SECRET) console.warn('JWT_SECRET not set — using fallback secret (dev only)');
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email && email.trim().toLowerCase();
    password = password || '';

    const user = await User.findOne({ email });
    if (!user) {
      console.warn('Login attempt with unknown email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.warn('Login failed for email (bad password):', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_change_me';
    if (!process.env.JWT_SECRET) console.warn('JWT_SECRET not set — using fallback secret (dev only)');
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
