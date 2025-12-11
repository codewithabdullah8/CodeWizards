// backend/src/routes/professionalDiary.js
const express = require('express');
const router = express.Router();
const ProfessionalDiary = require('../models/ProfessionalDiary');
const auth = require('../middleware/auth'); // assumes middleware exists and sets req.user

// Create new professional entry (protected)
router.post('/new', auth, async (req, res) => {
  try {
    const { title, description, category, mood, images, date } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Missing required fields' });

    const entry = await ProfessionalDiary.create({
      userId: req.user.id,
      title,
      description,
      category: category || 'General',
      mood: mood || 'Neutral',
      images: images || [],
      date: date || new Date()
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error('Create professional entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all entries for logged-in user (protected)
router.get('/all', auth, async (req, res) => {
  try {
    const entries = await ProfessionalDiary.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Get all professional entries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single entry by id (protected)
router.get('/entry/:id', auth, async (req, res) => {
  try {
    const entry = await ProfessionalDiary.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    // ensure owner
    if (entry.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json(entry);
  } catch (err) {
    console.error('Get professional entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update entry (protected)
router.put('/update/:id', auth, async (req, res) => {
  try {
    const entry = await ProfessionalDiary.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    Object.assign(entry, req.body);
    const updated = await entry.save();
    res.json(updated);
  } catch (err) {
    console.error('Update professional entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete entry (protected)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const entry = await ProfessionalDiary.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    if (entry.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    await entry.remove();
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error('Delete professional entry error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get entries by date (yyyy-mm-dd) (protected)
router.get('/date/:date', auth, async (req, res) => {
  try {
    const target = new Date(req.params.date);
    const next = new Date(target);
    next.setDate(next.getDate() + 1);

    const entries = await ProfessionalDiary.find({
      userId: req.user.id,
      date: { $gte: target, $lt: next }
    }).sort({ date: -1 });

    res.json(entries);
  } catch (err) {
    console.error('Get professional entries by date error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
