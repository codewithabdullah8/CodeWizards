// backend/src/models/Personal.js
const mongoose = require('mongoose');

const PersonalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  mood: { type: String, default: 'Neutral' },
  images: [{ type: String }],
  date: { type: Date, default: Date.now },
  // Mood check-in questions
  energy: { type: Number, min: 1, max: 5, default: 3 },
  stress: { type: Number, min: 1, max: 5, default: 3 },
  positivity: { type: Number, min: 1, max: 5, default: 3 },
  focus: { type: Number, min: 1, max: 5, default: 3 },
  sleep: { type: Number, min: 1, max: 5, default: 3 },
}, { timestamps: true });

module.exports = mongoose.model('Personal', PersonalSchema);