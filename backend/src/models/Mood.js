const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    answers: {
      energy: Number,
      stress: Number,
      positivity: Number,
      focus: Number,
      sleep: Number,
      emotion: String,
    },

    mood: {
      type: String,
      enum: ["happy", "neutral", "sad", "angry", "tired"],
      required: true,
    },

    reasons: [String],
    suggestions: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mood", moodSchema);