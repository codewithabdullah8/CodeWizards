// backend/src/routes/personal.js
const express = require('express');
const router = express.Router();
const Personal = require('../models/Personal');
const Mood = require('../models/mood');
const auth = require('../middleware/auth');

// Helper function to get local date string (YYYY-MM-DD)
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to calculate mood from answers
function calculateMood(answers) {
  const { energy, stress, positivity } = answers;

  if (positivity >= 4 && stress <= 2) {
    return {
      mood: "happy",
      reasons: ["High positivity", "Low stress"],
      suggestions: ["Keep your routine", "Enjoy the moment"],
    };
  }

  if (stress >= 4 && energy <= 2) {
    return {
      mood: "tired",
      reasons: ["High stress", "Low energy"],
      suggestions: ["Take rest", "Improve sleep"],
    };
  }

  if (positivity <= 2 && stress >= 4) {
    return {
      mood: "sad",
      reasons: ["Low positivity", "High stress"],
      suggestions: ["Talk to someone", "Do a calming activity"],
    };
  }

  if (stress >= 4 && energy >= 4) {
    return {
      mood: "angry",
      reasons: ["High stress", "High energy"],
      suggestions: ["Take a break", "Do breathing exercises"],
    };
  }

  return {
    mood: "neutral",
    reasons: ["Balanced day"],
    suggestions: ["Maintain consistency"],
  };
}

// Create new personal entry (protected)
router.post('/new', auth, async (req, res) => {
  try {
    const { title, content, category, mood, images, date, energy, stress, positivity, focus, sleep } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Missing required fields' });

    const entry = await Personal.create({
      userId: req.user.id,
      title,
      content,
      category: category || 'General',
      mood: mood || 'Neutral',
      images: images || [],
      date: date || new Date(),
      energy: energy || 3,
      stress: stress || 3,
      positivity: positivity || 3,
      focus: focus || 3,
      sleep: sleep || 3,
    });

    // Also save mood data to Mood collection if mood questions were answered
    if (energy || stress || positivity || focus || sleep) {
      const entryDate = date ? new Date(date) : new Date();
      const dateString = getLocalDateString(entryDate);
      
      const answers = {
        energy: energy || 3,
        stress: stress || 3,
        positivity: positivity || 3,
        focus: focus || 3,
        sleep: sleep || 3,
      };

      const moodResult = calculateMood(answers);

      await Mood.findOneAndUpdate(
        { user: req.user.id, date: dateString },
        {
          user: req.user.id,
          date: dateString,
          answers: answers,
          mood: moodResult.mood,
          reasons: moodResult.reasons,
          suggestions: moodResult.suggestions,
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(entry);
  } catch (err) {
    console.error('Create personal entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all entries for logged-in user (protected)
router.get('/all', auth, async (req, res) => {
  try {
    const entries = await Personal.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Get all personal entries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single entry by id (protected)
router.get('/entry/:id', auth, async (req, res) => {
  try {
    const entry = await Personal.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json(entry);
  } catch (err) {
    console.error('Get personal entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update entry (protected)
router.put('/update/:id', auth, async (req, res) => {
  try {
    const entry = await Personal.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    Object.assign(entry, req.body);
    const updated = await entry.save();
    res.json(updated);
  } catch (err) {
    console.error('Update personal entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete entry (protected)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const entry = await Personal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found or access denied' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Delete personal entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get entries by date (yyyy-mm-dd) (protected)
router.get('/date/:date', auth, async (req, res) => {
  try {
    const target = new Date(req.params.date);
    const next = new Date(target);
    next.setDate(next.getDate() + 1);

    const entries = await Personal.find({
      userId: req.user.id,
      date: { $gte: target, $lt: next }
    }).sort({ date: -1 });

    res.json(entries);
  } catch (err) {
    console.error('Get personal entries by date error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;