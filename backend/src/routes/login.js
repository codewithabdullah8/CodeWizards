const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /  -> expects { email, password }
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(400).json({ message: 'Invalid credentials' });

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
