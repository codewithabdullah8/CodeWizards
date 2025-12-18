// backend/src/models/ProfessionalDiary.js
const mongoose = require('mongoose');

const ProfessionalDiarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  mood: { type: String, default: 'Neutral' },
  images: { type: [String], default: [] },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProfessionalDiary', ProfessionalDiarySchema);
