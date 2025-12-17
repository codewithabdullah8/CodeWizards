// backend/src/routes/diaryRoutes.js

const express = require('express');
const router = express.Router();

const Diary = require('../models/Diary');
const auth = require('../middleware/auth');

// -------------------------
// GET /api/diary?limit=10
// (list recent entries)
// -------------------------
router.get('/', auth, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const entries = await Diary.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(entries);
  } catch (err) {
    console.error('GET /api/diary error:', err);
    res.status(500).json({ message: 'Failed to fetch entries' });
  }
});

// -------------------------
// GET /api/diary/:id
// (single entry)
// -------------------------
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await Diary.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    res.json(entry);
  } catch (err) {
    console.error('GET /api/diary/:id error:', err);
    res.status(500).json({ message: 'Failed to fetch entry' });
  }
});

// -------------------------
// POST /api/diary
// (create entry)
// -------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, musicKey } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: 'Title and content are required' });
    }

    const entry = await Diary.create({
      title,
      content,
      musicKey: musicKey || 'none',
      userId: req.user.id,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error('POST /api/diary error:', err);
    res.status(500).json({ message: 'Failed to create entry' });
  }
});

// -------------------------
// PUT /api/diary/:id
// (update entry)
// -------------------------
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, musicKey } = req.body;

    const updated = await Diary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(musicKey !== undefined ? { musicKey } : {}),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Entry not found' });

    res.json(updated);
  } catch (err) {
    console.error('PUT /api/diary/:id error:', err);
    res.status(500).json({ message: 'Failed to update entry' });
  }
});

// -------------------------
// DELETE /api/diary/:id
// (delete entry)
// -------------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Diary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: 'Entry not found' });

    res.json({ message: 'Deleted', entry: deleted });
  } catch (err) {
    console.error('DELETE /api/diary/:id error:', err);
    res.status(500).json({ message: 'Failed to delete entry' });
  }
});

module.exports = router;
