import React, { useState, useEffect } from "react";
import { saveMood, getHistoricalAnalysis } from "../api/mood";
import { motion } from "framer-motion";
import API from "../api";

export default function MoodCheckin() {
  const emotions = [
    { label: "😌 Calm", value: "calm", color: "#60a5fa" },
    { label: "😐 Normal", value: "normal", color: "#94a3b8" },
    { label: "😔 Low", value: "low", color: "#a78bfa" },
    { label: "😡 Irritated", value: "irritated", color: "#f87171" },
    { label: "😴 Exhausted", value: "exhausted", color: "#fb923c" },
  ];

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Weekly mood state
  const [moodRow, setMoodRow] = useState([
    { day: "monday", emoji: "😐", label: "Loading", isFuture: false, fullData: null },
    { day: "tuesday", emoji: "😐", label: "Loading", isFuture: false, fullData: null },
    { day: "wednesday", emoji: "😐", label: "Loading", isFuture: false, fullData: null },
    { day: "thursday", emoji: "😐", label: "Loading", isFuture: false, fullData: null },
    { day: "friday", emoji: "😐", label: "Loading", isFuture: false, fullData: null },
    { day: "saturday", emoji: "😐", label: "Loading", isFuture: false, fullData: null },
    { day: "sunday", emoji: "😐", label: "Loading", isFuture: false, fullData: null },
  ]);
  const [hoveredMoodIndex, setHoveredMoodIndex] = useState(null);
  const [weeklyAnalysis, setWeeklyAnalysis] = useState(null);

  // Mood emoji mapping
  const moodEmoji = {
    happy: "😄",
    sad: "😔",
    angry: "😠",
    neutral: "😐",
    anxious: "😰",
    calm: "😌",
    tired: "😴",
  };

  // Mood emoji mapping for weekly display
  const moodEmojiMap = {
    happy: "😄",
    sad: "😔",
    angry: "😠",
    anxious: "😰",
    neutral: "😐",
    calm: "😌",
    tired: "😴",
    none: "😐",
  };

  // Get emoji for mood
  const getMoodEmoji = (mood) => {
    return moodEmojiMap[mood?.toLowerCase()] || "😐";
  };

  // Calculate ring background color based on average score
  const getRingValue = (avgScore) => {
    return Math.round((avgScore / 5) * 100);
  };

  // Get distribution description
  const getDistributionNote = (distribution) => {
    if (!distribution) return "No data";
    const max = Math.max(
      distribution.joyful,
      distribution.calm,
      distribution.low,
      distribution.anxious,
      distribution.frustrated
    );
    if (
      max === 0 ||
      (distribution.calm > 20 && distribution.joyful > 20)
    ) {
      return "Balanced week";
    } else if (distribution.joyful === max) {
      return "Positive week";
    } else if (distribution.calm === max) {
      return "Steady week";
    } else if (distribution.low === max) {
      return "Challenging week";
    } else {
      return "Mixed feelings";
    }
  };

  // Generate dynamic insights based on mood data
  const generateInsights = (analysis) => {
    if (!analysis) return null;

    const insights = {
      main: "",
      actionItems: [],
    };

    const { distribution, dailyTrend, peakDay, averageScore, variability, streak } = analysis;

    // Analyze trend direction
    const firstThree = dailyTrend.slice(0, 3).filter(s => s > 0);
    const lastThree = dailyTrend.slice(4).filter(s => s > 0);
    const firstAvg = firstThree.length > 0 ? firstThree.reduce((a, b) => a + b) / firstThree.length : 0;
    const lastAvg = lastThree.length > 0 ? lastThree.reduce((a, b) => a + b) / lastThree.length : 0;

    // Main insight
    if (streak === 0) {
      insights.main = "Start logging your mood to get personalized insights. Consistency is key to understanding your patterns.";
      insights.actionItems = ["Log your first mood check-in", "Set a daily reminder for mood check-ins"];
    } else if (averageScore >= 4) {
      if (lastAvg > firstAvg) {
        insights.main = `Great week! You ended strong with a ${lastAvg > firstAvg ? "positive" : "steady"} trend. Your peak day was ${peakDay}—try to replicate that day's activities.`;
        insights.actionItems = [
          "Document what made " + peakDay + " so great",
          "Maintain your current routine those days",
        ];
      } else {
        insights.main = `Strong start to your week! You averaged ${averageScore.toFixed(1)}/5 across ${streak} logged days. ${peakDay} was your best—consistency helps.`;
        insights.actionItems = ["Reflect on what went well", "Prepare for the week ahead"];
      }
    } else if (averageScore >= 3) {
      if (variability === "High") {
        insights.main = `Your week had ups and downs (${averageScore.toFixed(1)}/5 avg). High variability suggests external factors. Identify what causes your mood swings.`;
        insights.actionItems = [
          "Track mood triggers on challenging days",
          "Stabilize your routine on low-mood days",
        ];
      } else {
        insights.main = `Balanced week at ${averageScore.toFixed(1)}/5 average. Your mood stayed relatively stable. Peak was ${peakDay}—good consistency!`;
        insights.actionItems = ["Maintain this stability", "Explore what one small change could help you rise above 4"];
      }
    } else {
      insights.main = `Challenging week at ${averageScore.toFixed(1)}/5 average. ${
        distribution.low > 30 ? "Low moods dominated." : "Mixed feelings throughout."
      } Consider what's weighing on you and take small breaks.`;
      insights.actionItems = [
        "Reach out to someone you trust",
        "Try a stress-relief activity (walk, music, meditation)",
        "Review what affected " + (peakDay || "your best moment"),
      ];
    }

    // Add distribution-based insights
    if (distribution.anxious > 40) {
      insights.actionItems.push("Practice breathing exercises or meditation");
    }
    if (distribution.frustrated > 30) {
      insights.actionItems.push("Take breaks when feeling overloaded");
    }
    if (distribution.joyful > 40) {
      insights.actionItems.push("Capture these positive moments in your diary");
    }

    return insights;
  };

  // Weekly moods loader
  const loadWeeklyMoods = async () => {
    try {
      const { data } = await API.get("/mood/week");

      const week = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));

      const mapped = week.map((day, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);

        // Use local date string instead of ISO string to avoid timezone issues
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayNum}`;
        
        const found = data.find(m => m.date === dateStr);
        const isFuture = d > today;

        if (!found) {
          return {
            day,
            emoji: "😐",
            label: isFuture ? "Upcoming" : "Not logged",
            isFuture,
            fullData: null,
          };
        }

        const moodKey = found.mood?.toLowerCase() || "neutral";
        const emoji = moodEmojiMap[moodKey] || "😐";

        return {
          day,
          emoji,
          label: found.mood ? found.mood.charAt(0).toUpperCase() + found.mood.slice(1) : "Unknown",
          isFuture,
          fullData: found,
        };
      });

      setMoodRow(mapped);
    } catch (err) {
      console.error("Weekly mood error", err);
      const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
      setMoodRow(
        days.map((day) => ({
          day,
          emoji: "😐",
          label: "Not logged",
          isFuture: false,
          fullData: null,
        }))
      );
    }
  };

  // Load weekly analysis
  const loadWeeklyAnalysis = async () => {
    try {
      const { data } = await API.get("/mood/analysis/week");
      setWeeklyAnalysis(data);
    } catch (err) {
      console.error("Weekly analysis error", err);
    }
  };

  // Load historical analyses on component mount
  useEffect(() => {
    loadHistory();
    loadWeeklyMoods();
    loadWeeklyAnalysis();

    // Listen for mood check-in success to update history
    const handleMoodSuccess = () => {
      loadHistory();
      loadWeeklyMoods();
      loadWeeklyAnalysis();
    };

    window.addEventListener("mood-check-in-success", handleMoodSuccess);
    return () => window.removeEventListener("mood-check-in-success", handleMoodSuccess);
  }, []);

  // Load historical weekly analyses
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await getHistoricalAnalysis();
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Group weekly analyses by month
  const groupByMonth = (weeks) => {
    const grouped = {};
    weeks.forEach(week => {
      const startDate = new Date(week.startDate);
      const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          monthName,
          weeks: [],
          sortDate: startDate
        };
      }
      grouped[monthKey].weeks.push(week);
    });
    
    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => b.sortDate - a.sortDate);
  };

  return (
    <div className="container" style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "10px",
        }}>
          🧠 Mood Tracker
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          View your mood patterns and insights. Record your mood in the Personal tab.
        </p>
      </motion.div>

      {/* This Week's Mood Card */}
      <motion.div
        className="card border-0"
        style={{
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
          borderRadius: '16px',
          overflow: 'visible',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          marginBottom: '30px',
          zIndex: hoveredMoodIndex !== null ? 10000 : 'auto'
        }}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="card-body p-0" style={{ overflow: 'visible', position: 'relative' }}>
          {/* Mood Tracker Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px 24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px'
          }}>
            <i className="bi bi-emoji-smile" style={{ fontSize: '20px', opacity: '0.9' }}></i>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>This Week's Mood</span>
          </div>

          {/* Mood Content */}
          <div style={{ paddingTop: '24px', paddingRight: '24px', paddingBottom: '24px', paddingLeft: '24px', position: 'relative', overflow: 'visible' }}>
            <div className="d-flex gap-3 justify-content-between mood-container" style={{ flexWrap: "nowrap", overflowX: "auto", overflowY: "visible", position: "relative" }}>
              {moodRow.map((mood, i) => (
              <div
                key={i}
                className="mood-item text-center"
                style={{ 
                  flex: "0 0 auto", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "5px", 
                  position: "relative", 
                  zIndex: hoveredMoodIndex === i ? 9999 : 1,
                  padding: "10px",
                  borderRadius: "12px",
                  background: hoveredMoodIndex === i ? "rgba(102, 126, 234, 0.1)" : "transparent",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={() => setHoveredMoodIndex(i)}
                onMouseLeave={() => setHoveredMoodIndex(null)}
              >
                <div
                  className="mood-button rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "70px",
                    height: "70px",
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: "32px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: "3px solid rgba(102, 126, 234, 0.2)",
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                    opacity: mood.isFuture ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!mood.isFuture) {
                      e.currentTarget.style.border = "3px solid #667eea"
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = "3px solid rgba(102, 126, 234, 0.2)"
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)'
                  }}
                >
                  {mood.emoji}
                </div>
                <small style={{ whiteSpace: "nowrap", color: '#475569', fontWeight: '600', fontSize: '12px' }}>
                  {mood.day.charAt(0).toUpperCase() + mood.day.slice(1)}
                </small>
                <small style={{ fontSize: "11px", whiteSpace: "nowrap", color: '#667eea', fontWeight: '700', letterSpacing: '0.5px' }}>
                  {mood.label.toUpperCase()}
                </small>

                {/* Mood Details Tooltip */}
                {hoveredMoodIndex === i && mood.fullData && (
                  <div
                    className="mood-tooltip"
                    style={{
                      position: "fixed",
                      top: "200px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: "12px",
                      padding: "18px",
                      boxShadow: "0 10px 40px rgba(102, 126, 234, 0.6)",
                      zIndex: 9999999,
                      minWidth: "260px",
                      maxWidth: "300px",
                      pointerEvents: "none",
                      whiteSpace: "normal",
                    }}
                  >
                    <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "14px", textAlign: "center", textTransform: "capitalize", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "10px" }}>
                      {moodEmojiMap[mood.fullData.mood] || "😊"} {mood.fullData.mood}
                    </div>
                    
                    {mood.fullData.reasons && mood.fullData.reasons.length > 0 && (
                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          📌 Reasons
                        </div>
                        <ul style={{ margin: "0", paddingLeft: "18px", fontSize: "11px", lineHeight: "1.6" }}>
                          {mood.fullData.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {mood.fullData.suggestions && mood.fullData.suggestions.length > 0 && (
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "600", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                          💡 Suggestions
                        </div>
                        <ul style={{ margin: "0", paddingLeft: "18px", fontSize: "11px", lineHeight: "1.6" }}>
                          {mood.fullData.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Triangle pointer */}
                    <div style={{
                      position: "absolute",
                      bottom: "-8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "0",
                      height: "0",
                      borderLeft: "8px solid transparent",
                      borderRight: "8px solid transparent",
                      borderTop: "8px solid #764ba2",
                    }} />
                  </div>
                )}
              </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mood Analysis Card */}
      <motion.div
        className="card border-0 mt-4 mood-analysis-card"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ marginBottom: '30px' }}
      >
        <div className="card-body p-0">
          <div className="mood-analysis__header">
            <div className="mood-analysis__title">
              <span className="mood-analysis__icon">
                <i className="bi bi-graph-up"></i>
              </span>
              <div>
                <div className="mood-analysis__eyebrow">Mood Analysis</div>
                <div className="mood-analysis__sub">Consistency + sentiment across the last 7 days</div>
              </div>
            </div>
            <div className="mood-analysis__pill">This Week</div>
          </div>

          <div className="mood-analysis__body">
            <div className="mood-analysis__grid">
              <div className="mood-panel mood-panel--summary">
                <div className="mood-summary">
                  <div className="mood-summary__emoji">
                    {weeklyAnalysis ? getMoodEmoji(weeklyAnalysis.overallMood) : "😐"}
                  </div>
                  <div className="mood-summary__content">
                    <span className="mood-summary__label">Overall Mood</span>
                    <h4 className="mood-summary__value">
                      {weeklyAnalysis
                        ? weeklyAnalysis.overallMood.charAt(0).toUpperCase() + weeklyAnalysis.overallMood.slice(1)
                        : "Loading"}
                    </h4>
                    <span className="mood-summary__meta">
                      {weeklyAnalysis
                        ? `${weeklyAnalysis.streak} entries ◆ ${weeklyAnalysis.peakDay || "No peak"} was your best day`
                        : "Loading..."}
                    </span>
                  </div>
                  <div
                    className="mood-summary__ring"
                    style={{
                      "--value": weeklyAnalysis ? getRingValue(weeklyAnalysis.averageScore) : 0,
                    }}
                    aria-label={`Energy level ${
                      weeklyAnalysis ? getRingValue(weeklyAnalysis.averageScore) : 0
                    } percent`}
                  ></div>
                </div>

                <div className="mood-summary__chips">
                  <span className="mood-chip">
                    Streak: {weeklyAnalysis ? weeklyAnalysis.streak : 0} days
                  </span>
                  <span className="mood-chip">
                    Peak: {weeklyAnalysis ? weeklyAnalysis.peakScore : 0}/5
                  </span>
                  <span className="mood-chip">
                    Variability: {weeklyAnalysis ? weeklyAnalysis.variability : "N/A"}
                  </span>
                </div>

                <div className="mood-spark">
                  <span className="mood-spark__label">Weekly Trend</span>
                  <div className="mood-spark__bars">
                    {weeklyAnalysis && weeklyAnalysis.dailyTrend
                      ? weeklyAnalysis.dailyTrend.map((score, idx) => (
                          <span
                            key={idx}
                            className="mood-spark__bar"
                            style={{ "--h": `${(score / 5) * 100}%` }}
                          ></span>
                        ))
                      : [0, 0, 0, 0, 0, 0, 0].map((_, idx) => (
                          <span
                            key={idx}
                            className="mood-spark__bar"
                            style={{ "--h": "0%" }}
                          ></span>
                        ))}
                  </div>
                </div>
              </div>

              <div className="mood-panel mood-panel--stats">
                <div className="mood-stats__header">
                  <h6>Distribution</h6>
                  <span className="mood-note">
                    {weeklyAnalysis ? getDistributionNote(weeklyAnalysis.distribution) : "Loading"}
                  </span>
                </div>

                <div className="mood-stat">
                  <div className="mood-stat__row">
                    <span className="mood-stat__label">😄 Joyful</span>
                    <span className="mood-stat__value">
                      {weeklyAnalysis ? weeklyAnalysis.distribution.joyful : 0}%
                    </span>
                  </div>
                  <div className="mood-progress">
                    <motion.div
                      className="mood-progress__fill is-joy"
                      initial={{ width: 0 }}
                      animate={{
                        width: weeklyAnalysis ? `${weeklyAnalysis.distribution.joyful}%` : "0%",
                      }}
                      transition={{ duration: 0.8 }}
                    ></motion.div>
                  </div>
                </div>

                <div className="mood-stat">
                  <div className="mood-stat__row">
                    <span className="mood-stat__label">😌 Calm</span>
                    <span className="mood-stat__value">
                      {weeklyAnalysis ? weeklyAnalysis.distribution.calm : 0}%
                    </span>
                  </div>
                  <div className="mood-progress">
                    <motion.div
                      className="mood-progress__fill is-calm"
                      initial={{ width: 0 }}
                      animate={{
                        width: weeklyAnalysis ? `${weeklyAnalysis.distribution.calm}%` : "0%",
                      }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    ></motion.div>
                  </div>
                </div>

                <div className="mood-stat">
                  <div className="mood-stat__row">
                    <span className="mood-stat__label">😔 Low</span>
                    <span className="mood-stat__value">
                      {weeklyAnalysis ? weeklyAnalysis.distribution.low : 0}%
                    </span>
                  </div>
                  <div className="mood-progress">
                    <motion.div
                      className="mood-progress__fill is-low"
                      initial={{ width: 0 }}
                      animate={{
                        width: weeklyAnalysis ? `${weeklyAnalysis.distribution.low}%` : "0%",
                      }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    ></motion.div>
                  </div>
                </div>

                <div className="mood-stat">
                  <div className="mood-stat__row">
                    <span className="mood-stat__label">😰 Anxious</span>
                    <span className="mood-stat__value">
                      {weeklyAnalysis ? weeklyAnalysis.distribution.anxious : 0}%
                    </span>
                  </div>
                  <div className="mood-progress">
                    <motion.div
                      className="mood-progress__fill is-anxious"
                      initial={{ width: 0 }}
                      animate={{
                        width: weeklyAnalysis ? `${weeklyAnalysis.distribution.anxious}%` : "0%",
                      }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    ></motion.div>
                  </div>
                </div>

                <div className="mood-stat">
                  <div className="mood-stat__row">
                    <span className="mood-stat__label">😠 Frustrated</span>
                    <span className="mood-stat__value">
                      {weeklyAnalysis ? weeklyAnalysis.distribution.frustrated : 0}%
                    </span>
                  </div>
                  <div className="mood-progress">
                    <motion.div
                      className="mood-progress__fill is-frustrated"
                      initial={{ width: 0 }}
                      animate={{
                        width: weeklyAnalysis
                          ? `${weeklyAnalysis.distribution.frustrated}%`
                          : "0%",
                      }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* HISTORICAL ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ marginTop: "50px" }}
      >
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "var(--text-primary)",
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          📊 Monthly Mood History
        </h2>
        
        {historyLoading ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}></div>
            <p style={{ marginTop: "20px", color: "var(--text-secondary)" }}>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📭</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              No historical data yet. Start tracking your mood to see your monthly history!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "40px" }}>
            {groupByMonth(history).map((monthGroup, monthIdx) => (
              <div key={monthIdx}>
                {/* Month Header */}
                <h3 style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "20px",
                  paddingBottom: "10px",
                  borderBottom: "2px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  📅 {monthGroup.monthName}
                </h3>
                
                {/* Weeks in this month */}
                <div style={{ display: "grid", gap: "20px" }}>
                  {monthGroup.weeks.map((week, idx) => {
                    const startDate = new Date(week.startDate);
                    const endDate = new Date(week.endDate);
                    const dateRange = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="card"
                        style={{
                          overflow: "hidden",
                          borderLeft: `4px solid ${
                            week.overallMood === "happy" ? "#10b981" :
                            week.overallMood === "sad" ? "#8b5cf6" :
                            week.overallMood === "anxious" ? "#f59e0b" :
                            week.overallMood === "angry" ? "#f87171" :
                            "#60a5fa"
                          }`,
                        }}
                      >
                        <div className="card-body" style={{ padding: "1.5rem" }}>
                          {/* Header */}
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "20px",
                            flexWrap: "wrap",
                            gap: "15px",
                          }}>
                            <div style={{ flex: "1 1 300px" }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "8px",
                              }}>
                                <span style={{ fontSize: "2rem" }}>
                                  {moodEmoji[week.overallMood] || "😐"}
                                </span>
                                <h4 style={{
                                  margin: "0",
                                  fontSize: "1.3rem",
                                  fontWeight: "700",
                                  color: "var(--text-primary)",
                                  textTransform: "capitalize",
                                }}>
                                  {week.overallMood}
                                </h4>
                              </div>
                              <p style={{
                                margin: "0",
                                fontSize: "0.9rem",
                                color: "var(--text-secondary)",
                              }}>
                                {dateRange}
                              </p>
                            </div>
                            
                            <div style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}>
                              <div style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                              }}>
                                ⭐ {week.averageScore}/5
                              </div>
                              <div style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                              }}>
                                🔥 {week.streak} days
                              </div>
                              <div style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                              }}>
                                📊 {week.variability}
                              </div>
                            </div>
                          </div>
                          
                          {/* Distribution */}
                          <div style={{ marginBottom: "15px" }}>
                            <p style={{
                              fontWeight: "600",
                              color: "var(--text-primary)",
                              marginBottom: "12px",
                              fontSize: "0.95rem",
                            }}>
                              Mood Distribution
                            </p>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                              gap: "10px",
                            }}>
                        <div style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: "var(--bg-secondary)",
                          textAlign: "center",
                        }}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>😄</div>
                                <div style={{
                                  fontSize: "0.85rem",
                                  color: "var(--text-secondary)",
                                  marginBottom: "3px",
                                }}>Joyful</div>
                                <div style={{
                                  fontSize: "1.1rem",
                                  fontWeight: "700",
                                  color: "#10b981",
                                }}>{week.distribution.joyful}%</div>
                              </div>
                        <div style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: "var(--bg-secondary)",
                          textAlign: "center",
                        }}>
                          <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>😌</div>
                          <div style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginBottom: "3px",
                          }}>Calm</div>
                          <div style={{
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#60a5fa",
                          }}>{week.distribution.calm}%</div>
                        </div>
                        <div style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: "var(--bg-secondary)",
                          textAlign: "center",
                        }}>
                          <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>😔</div>
                          <div style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginBottom: "3px",
                          }}>Low</div>
                          <div style={{
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#8b5cf6",
                          }}>{week.distribution.low}%</div>
                        </div>
                        <div style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: "var(--bg-secondary)",
                          textAlign: "center",
                        }}>
                          <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>😰</div>
                          <div style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginBottom: "3px",
                          }}>Anxious</div>
                          <div style={{
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#f59e0b",
                          }}>{week.distribution.anxious}%</div>
                        </div>
                        <div style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: "var(--bg-secondary)",
                          textAlign: "center",
                        }}>
                          <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>😠</div>
                          <div style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginBottom: "3px",
                          }}>Frustrated</div>
                          <div style={{
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#f87171",
                          }}>{week.distribution.frustrated}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Peak Day */}
                    {week.peakDay && (
                      <div style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                        <span style={{ fontSize: "1.5rem" }}>🏆</span>
                        <p style={{ margin: "0", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          <strong>Peak Day:</strong> {week.peakDay} with a score of {week.peakScore}/5
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
        )}
      </motion.div>
    </div>
  );
}