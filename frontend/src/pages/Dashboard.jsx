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

  const [weeklyAnalysis, setWeeklyAnalysis] = useState(null);

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

const loadWeeklyAnalysis = async () => {
  try {
    const { data } = await API.get("/mood/analysis/week");
    setWeeklyAnalysis(data);
  } catch (err) {
    console.error("Weekly analysis error", err);
  }
};

const getMoodEmoji = (mood) => {
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
  return moodEmojiMap[mood?.toLowerCase()] || "😐";
};

const generateInsights = (analysis) => {
  if (!analysis) return null;

  const insights = {
    main: "",
    actionItems: [],
  };

  const { distribution, dailyTrend, peakDay, averageScore, variability, streak } = analysis;

  const firstThree = dailyTrend.slice(0, 3).filter(s => s > 0);
  const lastThree = dailyTrend.slice(4).filter(s => s > 0);
  const firstAvg = firstThree.length > 0 ? firstThree.reduce((a, b) => a + b) / firstThree.length : 0;
  const lastAvg = lastThree.length > 0 ? lastThree.reduce((a, b) => a + b) / lastThree.length : 0;

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const eventsForDate = scheduleItems.filter((item) => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    
    // Only show events for today and future dates
    return (
      itemDate >= today &&
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
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  const eventDays = new Set();
  items.forEach((item) => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0); // Reset time for comparison
    
    // Only show events for today and future dates
    if (
      itemDate >= today &&
      itemDate.getFullYear() === year &&
      itemDate.getMonth() === month
    ) {
      eventDays.add(itemDate.getDate());
    }
  });
  
  setDaysWithEvents(eventDays);
};

 useEffect(() => {
  loadQuote();
  loadTodayReminder();
  loadScheduleItems();
  loadWeeklyAnalysis();
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
                      onClick={(e) => {
                        e.stopPropagation();
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
                          {event.priority && (
                            <div className="event-priority">
                              <span
                                className={`priority-badge priority-${event.priority?.toLowerCase() || "medium"}`}
                              >
                              {event.priority || "Medium"}
                            </span>
                            </div>
                          )}
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

            {/* Weekly Insight Section */}
            <motion.div
              className="card border-0 mt-4"
              style={{
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'
              }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="card-body p-0">
                {/* Weekly Insight Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '16px 24px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <i className="bi bi-lightbulb-fill" style={{ fontSize: '20px', opacity: '0.9' }}></i>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Weekly Insight</span>
                </div>
                
                {/* Weekly Insight Content */}
                <div style={{ padding: '24px' }}>
                  {weeklyAnalysis ? (
                    <>
                      <p style={{
                        fontSize: '16px',
                        color: '#1e293b',
                        lineHeight: '1.6',
                        marginBottom: '16px'
                      }}>
                        {generateInsights(weeklyAnalysis).main}
                      </p>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {generateInsights(weeklyAnalysis).actionItems.map((item, idx) => (
                          <button
                            key={idx}
                            className="btn btn-sm btn-outline-primary"
                            style={{
                              fontSize: '12px',
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              padding: '8px 12px',
                              lineHeight: '1.3',
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
                      Complete your mood check-in to see personalized insights.
                    </p>
                  )}
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
