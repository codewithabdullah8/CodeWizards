// backend/src/models/Personal.js
const mongoose = require('mongoose');

const PersonalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  mood: { type: String, default: 'Neutral' },
  images: [{ type: String }],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Personal', PersonalSchema);