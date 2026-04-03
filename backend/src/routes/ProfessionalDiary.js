const express = require("express");
const router = express.Router();
const ProfessionalDiary = require("../models/ProfessionalDiary");
const auth = require("../middleware/auth");

// ➤ Get all entries
router.get("/all", auth, async (req, res) => {
  try {
    const entries = await ProfessionalDiary.find({
      userId: req.user.id,
    }).sort({ date: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ➤ Get single entry
router.get("/entry/:id", auth, async (req, res) => {
  try {
    const entry = await ProfessionalDiary.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(entry);
  } catch (err) {
    res.status(404).json({ message: "Entry not found" });
  }
});

// ➤ Create entry
router.post("/new", auth, async (req, res) => {
  try {
    const entry = await ProfessionalDiary.create({
      ...req.body,
      userId: req.user.id,
    });

    res.json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ➤ Update entry
router.put("/update/:id", auth, async (req, res) => {
  try {
    const updated = await ProfessionalDiary.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ➤ Delete entry
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const deleted = await ProfessionalDiary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ➤ Get entries by date
router.get("/date/:date", auth, async (req, res) => {
  try {
    const entries = await ProfessionalDiary.find({
      userId: req.user.id,
      date: req.params.date,
    });

    res.json(entries);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
