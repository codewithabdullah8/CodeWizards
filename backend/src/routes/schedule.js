// backend/src/routes/schedule.js
const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');



// Create new schedule item (protected)
router.post('/new', auth, async (req, res) => {
  try {
    const { title, description, date, time, category, priority } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Missing required fields' });

    const item = await Schedule.create({
      userId: req.user.id,
      title,
      description,
      date,
      time,
      category: category || 'General',
      priority: priority || 'Medium'
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('Create schedule item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all schedule items for logged-in user (protected)
router.get('/all', auth, async (req, res) => {
  try {
    const items = await Schedule.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
    res.json(items);
  } catch (err) {
    console.error('Get all schedule items error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single schedule item by id (protected)
router.get('/item/:id', auth, async (req, res) => {
  try {
    const item = await Schedule.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json(item);
  } catch (err) {
    console.error('Get schedule item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update schedule item (protected)
router.put('/update/:id', auth, async (req, res) => {
  try {
    const item = await Schedule.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    console.error('Update schedule item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete schedule item (protected)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const item = await Schedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found or access denied' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete schedule item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get schedule items by date (yyyy-mm-dd) (protected)
router.get('/date/:date', auth, async (req, res) => {
  try {
    const target = new Date(req.params.date);
    const next = new Date(target);
    next.setDate(next.getDate() + 1);

    const items = await Schedule.find({
      userId: req.user.id,
      date: { $gte: target, $lt: next }
    }).sort({ time: 1 });

    res.json(items);
  } catch (err) {
    console.error('Get schedule items by date error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark as completed (protected)
router.patch('/complete/:id', auth, async (req, res) => {
  try {
    const item = await Schedule.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    item.completed = !item.completed;
    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    console.error('Toggle complete schedule item error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;  