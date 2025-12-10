const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /  -> expects { name, email, password }
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });

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
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
