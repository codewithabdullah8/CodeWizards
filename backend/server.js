// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const authRoutes = require('./src/routes/auth');          // /api/auth/...
const diaryRoutes = require('./src/routes/diaryRoutes');  // /api/diary/...
const reminderRoutes = require('./src/routes/reminders'); // /api/reminders/...

// Optional / new models (keeps compatibility if they exist)
let User, Diary, Reminder, ProfessionalDiary;
try { User = require('./src/models/User'); } catch (e) {}
try { Diary = require('./src/models/Diary'); } catch (e) {}
try { Reminder = require('./src/models/Reminder'); } catch (e) {}
try { ProfessionalDiary = require('./src/models/ProfessionalDiary/ProfessionalDiary'); } catch (e) {}

const app = express();

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// ---------- HEALTH CHECK ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ---------- ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/reminders', reminderRoutes);

// Optional Professional Diary route (only enable if file exists)
try {
  // app.use('/api/professional-diary', require('./src/routes/ProfessionalDairy'));
  // app.use('/api/professional-diary', require('./src/routes/ProfessionalDiary'));
} catch (e) {}

// ---------- CONFIG ----------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydiaryDB';
const CRON_ENABLED = process.env.CRON_ENABLED !== 'false';

console.log(`Attempting to connect to MongoDB at ${MONGODB_URI}`);

if (MONGODB_URI.includes('<') || MONGODB_URI.includes('>')) {
  console.warn('MONGODB_URI appears to contain placeholder angle-brackets. Remove < and > from the URI.');
}

app.use('/api/professional-diary', require('./src/routes/ProfessionalDiary'));

const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// ---------- DB + SERVER START ----------
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // ---------- CRON JOB ----------
    if (CRON_ENABLED) {
      cron.schedule('5 0 * * *', async () => {
        try {

          if (!User || !Diary || !Reminder) {
            console.log('Cron skipped: required models missing.');
            return;
          }

          const today = new Date(); today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

          const users = await User.find({});

          for (const u of users) {
            const hasToday = await Diary.exists({
              userId: u._id,
              createdAt: { $gte: today, $lt: tomorrow }
            });

            if (!hasToday) {
              const exists = await Reminder.exists({ userId: u._id, date: today });

              if (!exists) {
                await Reminder.create({
                  userId: u._id,
                  date: today,
                  message: "You didn't write your diary today."
                });
              }
            }
          }

          console.log('Daily reminder check complete');
        } catch (e) {
          console.error('Cron error:', e.message);
        }
      });

      console.log('Cron scheduled 00:05.');
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error (full):', err);
    // exit with non-zero so process managers know startup failed
    process.exit(1);
  });
