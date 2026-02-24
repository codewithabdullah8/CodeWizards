const mongoose = require("mongoose");

const weeklyAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Week identifier: YYYY-WXX (e.g., 2026-W09 for week 9)
    weekId: {
      type: String,
      required: true,
    },

    // Start and end dates of the week (Monday-Sunday)
    startDate: String, // YYYY-MM-DD
    endDate: String,   // YYYY-MM-DD

    // Overall statistics
    overallMood: String, // happy, neutral, sad, etc.
    averageScore: Number, // 0-5

    // Mood distribution (percentages)
    distribution: {
      joyful: Number,    // happy, excited
      calm: Number,      // relaxed, peaceful
      low: Number,       // sad, tired
      anxious: Number,   // stressed, anxious
      frustrated: Number, // angry, irritated
    },

    // Trend data (7 daily values for the week)
    dailyTrend: [Number],

    // Analysis metrics
    streak: Number,      // consecutive days with entries
    peakDay: String,     // day with highest mood
    peakScore: Number,
    variability: String, // Low, Moderate, High

    // Mood entries for the week
    entries: [{
      date: String,
      mood: String,
      score: Number,
    }],

    // Flag to mark archived weeks (previous complete weeks)
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
weeklyAnalysisSchema.index({ user: 1, weekId: 1 });

module.exports = mongoose.model("WeeklyAnalysis", weeklyAnalysisSchema);
