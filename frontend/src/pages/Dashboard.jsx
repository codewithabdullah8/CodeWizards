import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../contexts/ToastContext";
// import API from "../api";
import ReminderAPI from "../api/reminders";
import QuoteAPI from "../api/quotes";
import ScheduleAPI from "../api/schedule";
import API from "../api";


export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [creatingSaving, setCreatingSaving] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createMusic, setCreateMusic] = useState("none");
  const [createError, setCreateError] = useState("");
  const [weeklyMoods, setWeeklyMoods] = useState([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth();
  const selectedDate = isCurrentMonth ? today.getDate() : null;

  const [quote, setQuote] = useState({
    text: "The best way to predict the future is to create it.",
    author: "Abraham Lincoln",
  });



  const moods = [
    { emoji: "😀", label: "Happy" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😊", label: "Happy" },
    { emoji: "😩", label: "Tired" },
    { emoji: "🤩", label: "Excited" },
    { emoji: "😎", label: "Relaxed" },
  ];

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

const loadQuote = async () => {
  try {
    const { data } = await QuoteAPI.getToday();
    setQuote(data);
  } catch (err) {
    console.error("Quote error", err);
  }
};

const [reminder, setReminder] = useState(null);

const loadTodayReminder = async () => {
  try {
    const { data } = await ReminderAPI.getToday();
    setReminder(data);
  } catch (err) {
    console.error("Reminder error", err);
  }
};

// Schedule calendar integration
const [scheduleItems, setScheduleItems] = useState([]);
const [daysWithEvents, setDaysWithEvents] = useState(new Set());
const [clickedDate, setClickedDate] = useState(null);
const [selectedEvents, setSelectedEvents] = useState([]);

const loadScheduleItems = async () => {
  try {
    const { data } = await ScheduleAPI.getItems();
    setScheduleItems(data);
    updateDaysWithEvents(data, currentDate);
  } catch (err) {
    console.error("Schedule error", err);
  }
};

// Handle date click to show events
const handleDateClick = (day) => {
  if (!day) return; // Skip empty cells
  
  setClickedDate(day);
  
  // Filter events for the clicked date
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const eventsForDate = scheduleItems.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === year &&
      itemDate.getMonth() === month &&
      itemDate.getDate() === day
    );
  });
  
  setSelectedEvents(eventsForDate);
};

const updateDaysWithEvents = (items, dateToCheck) => {
  const year = dateToCheck.getFullYear();
  const month = dateToCheck.getMonth();
  
  const eventDays = new Set();
  items.forEach((item) => {
    const itemDate = new Date(item.date);
    if (
      itemDate.getFullYear() === year &&
      itemDate.getMonth() === month
    ) {
      eventDays.add(itemDate.getDate());
    }
  });
  
  setDaysWithEvents(eventDays);
};

// Weekly moods loader - can be called after mood check-in to refresh
const loadWeeklyMoods = async () => {
  try {
    const { data } = await API.get("/mood/week");

    // data example: [{ date: "2026-02-24", mood: "happy", reason: "...", suggestions: [...] }]

    const week = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const mapped = week.map((day, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);

      const dateStr = d.toISOString().split("T")[0];
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
    // Fallback: show neutral mood for all days
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

 useEffect(() => {
  loadQuote();
  loadTodayReminder();
  loadScheduleItems();
  loadWeeklyMoods();
  loadWeeklyAnalysis();
  
  // Listen for mood check-in success event to refresh weekly moods
  const handleMoodCheckInSuccess = () => {
    loadWeeklyMoods();
    loadWeeklyAnalysis();
  };

  window.addEventListener("mood-check-in-success", handleMoodCheckInSuccess);
  
  return () => {
    window.removeEventListener("mood-check-in-success", handleMoodCheckInSuccess);
  };
}, []);

 useEffect(() => {
  updateDaysWithEvents(scheduleItems, currentDate);
}, [currentDate, scheduleItems]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const mondayStartIndex = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < mondayStartIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!createTitle.trim() || !createContent.trim()) {
      setCreateError("Title and content are required");
      return;
    }
    setCreatingSaving(true);

    try {
      const res = await ReminderAPI.post("/diary", {
        title: createTitle,
        content: createContent,
        ...(createMusic !== "none" ? { musicKey: createMusic } : {}),
      });

      setCreateTitle("");
      setCreateContent("");
      setCreateMusic("none");
      setCreating(false);

      addToast("Entry created successfully!", "success");
      navigate(`/entry/${res.data._id}`);
    } catch (err) {
      setCreateError("Failed to create entry");
    } finally {
      setCreatingSaving(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate((prev) =>
      new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };



  const calendarDays = getDaysInMonth();

  return (
    <motion.div
      className="dashboard-container py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-fluid px-4">
        <div className="row g-4">
          {/* LEFT: Calendar */}
          <div className="col-lg-4">
            <motion.div
              className="calendar-widget"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="calendar-widget__header">
                <span className="calendar-widget__month">{monthName}</span>
                <div className="calendar-widget__nav">
                  <button
                    className="calendar-widget__nav-btn"
                    onClick={previousMonth}
                    aria-label="Previous month"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button
                    className="calendar-widget__nav-btn"
                    onClick={nextMonth}
                    aria-label="Next month"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="calendar-widget__grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={i} className="calendar-widget__weekday">
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`calendar-widget__day ${
                      selectedDate && day === selectedDate ? "is-today" : ""
                    } ${!day ? "is-empty" : ""} ${
                      day && daysWithEvents.has(day) ? "has-event" : ""
                    } ${clickedDate === day ? "is-selected" : ""}`}
                    onClick={() => handleDateClick(day)}
                    style={{ cursor: day ? "pointer" : "default" }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Events Display Panel */}
              {clickedDate && (
                <motion.div
                  className="calendar-events-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="events-header">
                    <h4 className="events-date">
                      {new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        clickedDate
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </h4>
                    <button
                      onClick={() => {
                        setClickedDate(null);
                        setSelectedEvents([]);
                      }}
                      className="btn-close-events"
                      title="Close"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>

                  {selectedEvents.length > 0 ? (
                    <div className="events-list">
                      {selectedEvents.map((event) => (
                        <motion.div
                          key={event._id}
                          className="event-item"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="event-time">
                            {event.time || "All day"}
                          </div>
                          <div className="event-title">{event.title}</div>
                          {event.description && (
                            <div className="event-description">
                              {event.description.substring(0, 60)}
                              {event.description.length > 60 ? "..." : ""}
                            </div>
                          )}
                          <div className="event-priority">
                            <span
                              className={`priority-badge priority-${event.priority?.toLowerCase() || "medium"}`}
                            >
                              {event.priority || "Medium"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="events-empty">
                      <i className="bi bi-calendar-x"></i>
                      <p>No events for this date</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* RIGHT: Quote & Mood */}
          <div className="col-lg-8">
            <motion.div
              className="card border-0"
              style={{
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'
              }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="card-body p-0">
                {/* Quote Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '16px 24px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <i className="bi bi-chat-quote" style={{ fontSize: '20px', opacity: '0.9' }}></i>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Quote of the Day</span>
                </div>
                
                {/* Quote Content */}
                <div style={{ padding: '32px 24px' }}>
                  <blockquote className="blockquote mb-0" style={{ borderLeftColor: '#667eea' }}>
                    <p className="mb-4" style={{ 
                      fontSize: '18px', 
                      fontWeight: '500',
                      color: '#1e293b',
                      lineHeight: '1.6',
                      fontStyle: 'italic'
                    }}>
                      "{quote.text}"
                    </p>
                    <footer style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-person-circle" style={{ fontSize: '16px' }}></i>
                      {quote.author}
                    </footer>
                  </blockquote>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="card border-0"
              style={{
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
                borderRadius: '16px',
                overflow: 'visible',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                marginTop: '20px',
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

                    <motion.div
                      className="mood-panel mood-panel--insight"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <div className="insight-header">
                        <i className="bi bi-lightbulb-fill"></i>
                        Weekly Insight
                      </div>
                      {weeklyAnalysis ? (
                        <>
                          <p>{generateInsights(weeklyAnalysis).main}</p>
                          <div className="insight-actions">
                            {generateInsights(weeklyAnalysis).actionItems.map((item, idx) => (
                              <button
                                key={idx}
                                className="btn btn-sm btn-outline-light"
                                style={{
                                  fontSize: "12px",
                                  whiteSpace: "normal",
                                  wordWrap: "break-word",
                                  padding: "8px 12px",
                                  lineHeight: "1.3",
                                }}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p style={{ color: "#aaa", fontSize: "14px" }}>
                          Complete your mood check-in to see personalized insights.
                        </p>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {creating && (
        <motion.div
          className="modal-backdrop-custom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCreating(false)}
        >
          <motion.div
            className="modal-content-custom"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h4 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Create New Entry
              </h4>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setCreating(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body-custom">
              <form onSubmit={handleCreateSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Title</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Content</label>
                  <textarea
                    rows={6}
                    className="form-control"
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Background Music</label>
                  <select
                    className="form-select"
                    value={createMusic}
                    onChange={(e) => setCreateMusic(e.target.value)}
                  >
                    <option value="none">No Music</option>
                    <option value="calm">🌊 Calm Ocean</option>
                    <option value="focus">🎯 Deep Focus</option>
                    <option value="rain">🌧️ Gentle Rain</option>
                    <option value="nature">🌿 Forest Sounds</option>
                  </select>
                </div>

                {createError && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {createError}
                  </div>
                )}

                <div className="d-flex gap-3 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setCreating(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creatingSaving}
                  >
                    {creatingSaving ? (
                      <>
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Entry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8d4f8 0%, #d8c5f0 100%);
          padding-top: 2rem;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: calc(100vh - 64px);
        }

        body {
          overflow: hidden;
        }

        .calendar-label-card {
          background: linear-gradient(135deg, #ff8a9d 0%, #f8a5c2 100%);
          border-radius: 12px;
          padding: 18px 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(255, 138, 157, 0.2);
        }
        
        .calendar-rings {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          justify-content: center;
        }
        
        .ring {
          width: 10px;
          height: 10px;
          border: 2px solid #3d5a80;
          border-radius: 50%;
          background: transparent;
        }
        
        .calendar-label-text {
          color: white;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 2px;
          text-align: center;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          background: white;
          padding: 20px;
          border-radius: 12px;
        }

        .calendar-day-header {
          text-align: center;
          font-weight: 600;
          color: #adb5bd;
          font-size: 11px;
          padding: 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          color: #8e9aaf;
          background: #f8f9fa;
          border: none;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .calendar-day:hover:not(.empty) {
          background: #e9ecef;
          color: #5a67d8;
          transform: scale(1.05);
        }

        .calendar-day.active {
          background: #5a67d8;
          color: white;
          border: none;
          font-weight: 600;
        }

        .calendar-day.empty {
          background: transparent;
          border: none;
          cursor: default;
        }

        /* Dark Mode Calendar Styles */
        .dark-mode .calendar-grid {
          background: #1e293b;
        }

        .dark-mode .calendar-day-header {
          color: #94a3b8;
        }

        .dark-mode .calendar-day {
          color: #cbd5e1;
          background: #334155;
        }

        .dark-mode .calendar-day:hover:not(.empty) {
          background: #475569;
          color: #a78bfa;
        }

        .dark-mode .calendar-day.active {
          background: #7c3aed;
          color: white;
        }

        .dark-mode .calendar-day.empty {
          background: transparent;
        }

        .mood-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 0 0 calc(14.28% - 15px);
        }

        .modal-backdrop-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content-custom {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-body-custom {
          padding: 20px;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .mood-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .mood-container::-webkit-scrollbar {
          display: none;
        }

        .mood-analysis-container {
          max-height: 600px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .mood-analysis-container::-webkit-scrollbar {
          width: 8px;
        }

        .mood-analysis-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .mood-analysis-container::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #667eea, #764ba2);
          border-radius: 10px;
        }

        .mood-analysis-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #5568d3, #653a91);
        }

        .mood-stat {
          padding: 12px 0;
        }

        .mood-stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mood-stat-value {
          font-size: 13px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mood-progress-bar {
          height: 10px;
          background: #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .mood-progress-fill {
          height: 100%;
          border-radius: 5px;
          transition: width 0.3s ease;
        }

        .mood-overall-stat {
          box-shadow: 0 4px 12px rgba(254, 200, 150, 0.2);
        }

        .dark-mode .mood-analysis-container {
          background: #1e293b;
        }

        .dark-mode .mood-analysis-container::-webkit-scrollbar-track {
          background: #0f172a;
        }

        .dark-mode .mood-analysis-container::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #667eea, #764ba2);
        }

        .dark-mode .mood-stat-label {
          color: #cbd5e1;
        }

        .dark-mode .mood-progress-bar {
          background: #334155;
        }

        .dark-mode .card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%) !important;
        }

        .blockquote {
          border-left: 3px solid #667eea;
          padding-left: 15px;
          margin-left: 0;
        }
      `}</style>
    </motion.div>
  );
}
