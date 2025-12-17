// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const authRoutes = require('./src/routes/auth');
const diaryRoutes = require('./src/routes/diaryRoutes');
const reminderRoutes = require('./src/routes/reminders');

const app = express();
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();  

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ---------- Routes ----------
// Auth: /api/auth/login, /api/auth/signup
app.use('/api/auth', authRoutes);

// Diary: /api/diary, /api/diary/:id, ...
// (router itself will use "/", "/:id")
app.use('/api/diary', diaryRoutes);

// Reminders: /api/reminders/today, etc.
app.use('/api/reminders', reminderRoutes);

// ---------- Cron ----------
cron.schedule('5 0 * * *', () => {
  console.log('Cron scheduled 00:05.');
});

// ---------- DB + Server start ----------
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydiaryDB';

console.log(`Attempting to connect to MongoDB at ${MONGODB_URI}`);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
