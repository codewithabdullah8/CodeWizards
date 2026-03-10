const express = require('express');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendReminderEmail } = require('../utils/emailService');

const router = express.Router();

// Get today's reminder
router.get('/today', auth, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const r = await Reminder.findOne({ userId: req.user.id, date: today });
  res.json(r || null);
});

// Get all reminders for user
router.get('/', auth, async (req, res) => {
  const list = await Reminder.find({ userId: req.user.id })
    .sort({ date: -1 })
    .limit(30);
  res.json(list);
});

// Create a reminder and optionally send email
router.post('/', auth, async (req, res) => {
  try {
    const { date, message } = req.body;
    
    const reminder = new Reminder({
      userId: req.user.id,
      date: new Date(date),
      message: message || "You didn't write your diary today."
    });
    
    await reminder.save();
    
    // Check if user has email notifications enabled
    const user = await User.findById(req.user.id);
    if (user?.settings?.emailNotifications) {
      // Send email notification
      await sendReminderEmail(user.email, user.name, reminder.message);
    }
    
    res.json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;