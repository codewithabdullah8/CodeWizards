const express = require("express");
const router = express.Router();
const Mood = require("../models/mood");
const WeeklyAnalysis = require("../models/WeeklyAnalysis");
const auth = require("../middleware/auth");

// Helper function to get local date string (YYYY-MM-DD) without timezone conversion
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// POST – Save or update today's mood
router.post("/", auth, async (req, res) => {
  const userId = req.user.id;
  const today = getLocalDateString(new Date());

  const result = calculateMood(req.body.answers);

  const mood = await Mood.findOneAndUpdate(
    { user: userId, date: today },
    {
      user: userId,
      date: today,
      answers: req.body.answers,
      mood: result.mood,
      reasons: result.reasons,
      suggestions: result.suggestions,
    },
    { upsert: true, new: true }
  );

  res.json(mood);
});

// GET – Get weekly moods (Monday-Sunday of current week)
router.get("/week", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    
    // Calculate start of week (Monday)
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const startDate = getLocalDateString(startOfWeek);
    const endDate = getLocalDateString(endOfWeek);
    
    const moods = await Mood.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    res.json(moods);
  } catch (err) {
    console.error("Week moods error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET – Get monthly moods for calendar
router.get("/month", auth, async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET – Get current week's analysis
router.get("/analysis/week", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    
    // Calculate week boundaries
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startDate = getLocalDateString(startOfWeek);
    const endDate = new Date(startOfWeek);
    endDate.setDate(startOfWeek.getDate() + 6);
    const endDateStr = getLocalDateString(endDate);
    
    // Get week IDs
    const weekId = getWeekId(startOfWeek);
    
    // Archive previous week if it exists and new week started
    const previousWeekDate = new Date(startOfWeek);
    previousWeekDate.setDate(startOfWeek.getDate() - 7);
    const previousWeekId = getWeekId(previousWeekDate);
    
    if (weekId !== previousWeekId) {
      const previousAnalysis = await WeeklyAnalysis.findOne({ user: userId, weekId: previousWeekId });
      if (previousAnalysis && !previousAnalysis.archived) {
        previousAnalysis.archived = true;
        await previousAnalysis.save();
      }
    }
    
    // Fetch moods for the week
    const moods = await Mood.find({
      user: userId,
      date: { $gte: startDate, $lte: endDateStr }
    }).sort({ date: 1 });
    
    // Calculate analysis (includes neutral for missing days)
    const analysis = calculateWeeklyAnalysis(moods, startDate, endDateStr, weekId);
    
    // Store or update the analysis
    await WeeklyAnalysis.findOneAndUpdate(
      { user: userId, weekId },
      { ...analysis, user: userId, archived: false },
      { upsert: true, new: true }
    );
    
    res.json(analysis);
  } catch (err) {
    console.error("Week analysis error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET – Get historical weekly analyses (archived weeks)
router.get("/analysis/history", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 12 } = req.query; // Get last 12 weeks
    
    const history = await WeeklyAnalysis.find({ user: userId, archived: true })
      .sort({ startDate: -1 })
      .limit(parseInt(limit));
    
    res.json(history);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

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

// Helper function to get week ID (YYYY-WXX format)
function getWeekId(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Helper function to calculate weekly analysis
function calculateWeeklyAnalysis(moods, startDate, endDate, weekId) {
  // Map mood to category and score
  const moodToCategory = {
    happy: { cat: "joyful", score: 5 },
    excited: { cat: "joyful", score: 5 },
    relaxed: { cat: "calm", score: 4 },
    calm: { cat: "calm", score: 4 },
    neutral: { cat: "calm", score: 3 },
    tired: { cat: "low", score: 2 },
    sad: { cat: "low", score: 2 },
    anxious: { cat: "anxious", score: 2 },
    angry: { cat: "frustrated", score: 1 },
    irritated: { cat: "frustrated", score: 1 },
  };

  const distribution = { joyful: 0, calm: 0, low: 0, anxious: 0, frustrated: 0 };
  const dailyTrend = [];
  const loggedScores = [];
  let totalScore = 0;
  let peakScore = 0;
  let peakDay = null;
  const entries = [];
  let loggedDays = 0;

  // Calculate daily metrics for all 7 days
  const startD = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startD);
    dayDate.setDate(dayDate.getDate() + i);
    const dayStr = getLocalDateString(dayDate);
    const dayName = dayDate.toLocaleDateString("en-US", { weekday: "short" });
    
    const dayMood = moods.find(m => m.date === dayStr);
    
    if (dayMood) {
      // Mood was logged
      const moodInfo = moodToCategory[dayMood.mood.toLowerCase()] || { cat: "calm", score: 3 };
      distribution[moodInfo.cat]++;
      dailyTrend.push(moodInfo.score);
      loggedScores.push(moodInfo.score);
      totalScore += moodInfo.score;
      loggedDays++;
      
      if (moodInfo.score > peakScore) {
        peakScore = moodInfo.score;
        peakDay = dayName;
      }
      
      entries.push({
        date: dayStr,
        mood: dayMood.mood,
        score: moodInfo.score,
      });
    } else {
      // No mood logged for this day.
      dailyTrend.push(0);
    }
  }

  // Calculate distribution percentages based only on actual logged days.
  Object.keys(distribution).forEach(key => {
    distribution[key] = loggedDays > 0
      ? Math.round((distribution[key] / loggedDays) * 100)
      : 0;
  });

  const avgScore = loggedDays > 0 ? totalScore / loggedDays : null;
  let variability = "N/A";

  if (loggedDays > 0) {
    const variance = loggedScores.reduce((sum, score) => {
      return sum + Math.pow(score - avgScore, 2);
    }, 0) / loggedDays;
    const stdDev = Math.sqrt(variance);
    variability = "Low";
    if (stdDev > 1.5) variability = "High";
    else if (stdDev > 0.8) variability = "Moderate";
  }

  let overallMood = "none";

  if (loggedDays > 0) {
    const maxCat = Object.keys(distribution).reduce((a, b) => 
      distribution[a] > distribution[b] ? a : b
    );
    overallMood = maxCat === "joyful" ? "happy" : maxCat === "calm" ? "neutral" : maxCat === "low" ? "sad" : maxCat === "anxious" ? "anxious" : "angry";
  }

  return {
    weekId,
    startDate,
    endDate,
    overallMood,
    averageScore: avgScore === null ? null : Math.round(avgScore * 10) / 10,
    distribution,
    dailyTrend,
    streak: loggedDays,
    peakDay,
    peakScore,
    variability,
    entries,
  };
}

module.exports = router;