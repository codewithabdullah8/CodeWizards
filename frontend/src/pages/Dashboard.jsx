import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const storedUser = localStorage.getItem("mydiary_user");
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }
  const [creating, setCreating] = useState(false);
  const [creatingSaving, setCreatingSaving] = useState(false);
  const [showUpcomingPlans, setShowUpcomingPlans] = useState(false);
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
    addToast("Failed to load quote", "error");
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
    joyful: "✨",
    sad: "😔",
    angry: "😠",
    anxious: "😰",
    frustrated: "😤",
    stressed: "😓",
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
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const insights = generateInsights(weeklyAnalysis);
  const hasMoodData = (weeklyAnalysis?.streak ?? 0) > 0;
  const averageMood = hasMoodData && typeof weeklyAnalysis?.averageScore === "number"
    ? weeklyAnalysis.averageScore.toFixed(1)
    : "--";
  const streakValue = weeklyAnalysis?.streak ?? 0;
  const todayEventsCount = scheduleItems.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === today.getFullYear() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getDate() === today.getDate()
    );
  }).length;
  const upcomingEventsCount = scheduleItems.filter((item) => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    const currentDay = new Date(today);
    currentDay.setHours(0, 0, 0, 0);
    return itemDate >= currentDay;
  }).length;
  const upcomingPlans = scheduleItems
    .filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const currentDay = new Date(today);
      currentDay.setHours(0, 0, 0, 0);
      return itemDate >= currentDay;
    })
    .sort((a, b) => {
      const firstDate = new Date(`${new Date(a.date).toISOString().slice(0, 10)}T${a.time || "23:59"}`);
      const secondDate = new Date(`${new Date(b.date).toISOString().slice(0, 10)}T${b.time || "23:59"}`);
      return firstDate - secondDate;
    });
  const dominantMood = hasMoodData && weeklyAnalysis?.distribution
    ? Object.entries(weeklyAnalysis.distribution)
        .filter(([key]) => !["low", "high"].includes(key))
        .sort(([, a], [, b]) => b - a)[0]
    : null;
  const dominantMoodLabel = dominantMood?.[0]
    ? dominantMood[0].charAt(0).toUpperCase() + dominantMood[0].slice(1)
    : "No data";
  const reminderMessage = reminder?.message || "No reminder set for today. Add one to keep your writing routine consistent.";

  return (
    <motion.div
      className="dashboard-container py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-fluid px-4">
        <motion.section
          className="dashboard-hero"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <div className="dashboard-hero__copy">
            <span className="dashboard-kicker">{todayLabel}</span>
            <h1 className="dashboard-title">{greeting}, {firstName}</h1>
            <p className="dashboard-subtitle">
              Capture the day, review your mood pattern, and keep your next steps visible from one place.
            </p>

            <div className="dashboard-hero__actions">
              <Link
                to="/mood-checkin"
                className="dashboard-hero__btn dashboard-hero__btn--secondary"
              >
                <i className="bi bi-emoji-smile"></i>
                Mood Check-In
              </Link>
              <Link
                to="/recent"
                className="dashboard-hero__btn dashboard-hero__btn--ghost"
              >
                <i className="bi bi-clock-history"></i>
                Recent Entries
              </Link>
            </div>

            <div className="dashboard-hero__meta">
              <span className="dashboard-meta-pill">
                <i className="bi bi-bell"></i>
                {reminder ? "Reminder ready" : "No reminder yet"}
              </span>
              <span className="dashboard-meta-pill">
                <i className="bi bi-calendar-event"></i>
                {todayEventsCount} event{todayEventsCount === 1 ? "" : "s"} today
              </span>
            </div>
          </div>

          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-icon gradient-blue">
                <i className="bi bi-graph-up-arrow"></i>
              </span>
              <strong className="dashboard-stat-value">{averageMood}</strong>
              <span className="dashboard-stat-label">Weekly Avg Mood</span>
              <small className="dashboard-stat-note">{hasMoodData ? "Out of 5.0 this week" : "No mood check-ins yet"}</small>
            </div>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-icon gradient-coral">
                <i className="bi bi-fire"></i>
              </span>
              <strong className="dashboard-stat-value">{streakValue}</strong>
              <span className="dashboard-stat-label">Check-In Streak</span>
              <small className="dashboard-stat-note">Logged days in current run</small>
            </div>

            <button
              type="button"
              className="dashboard-stat-card dashboard-stat-card--interactive"
              onClick={() => setShowUpcomingPlans(true)}
            >
              <span className="dashboard-stat-icon gradient-mint">
                <i className="bi bi-calendar2-week"></i>
              </span>
              <strong className="dashboard-stat-value">{upcomingEventsCount}</strong>
              <span className="dashboard-stat-label">Upcoming Plans</span>
              <small className="dashboard-stat-note">Scheduled from today onward</small>
            </button>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-icon gradient-violet">
                <i className="bi bi-stars"></i>
              </span>
              <strong className="dashboard-stat-value">{getMoodEmoji(dominantMoodLabel)}</strong>
              <span className="dashboard-stat-label">Dominant Mood</span>
              <small className="dashboard-stat-note">{dominantMoodLabel}</small>
            </div>
          </div>
        </motion.section>

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
              className="dashboard-panel dashboard-panel--quote"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="dashboard-panel__header">
                <div className="dashboard-panel__title-wrap">
                  <span className="dashboard-panel__icon">
                    <i className="bi bi-chat-quote"></i>
                  </span>
                  <div>
                    <span className="dashboard-panel__eyebrow">Quote of the Day</span>
                    <h3 className="dashboard-panel__title">A line to anchor your day</h3>
                  </div>
                </div>
              </div>

              <div className="dashboard-panel__content">
                <blockquote className="dashboard-quote-block mb-0">
                  <p className="dashboard-quote-text">&quot;{quote.text}&quot;</p>
                  <footer className="dashboard-quote-author">
                    <i className="bi bi-person-circle"></i>
                    {quote.author}
                  </footer>
                </blockquote>
              </div>
            </motion.div>

            {/* Weekly Insight Section */}
            <motion.div
              className="dashboard-panel dashboard-panel--insight mt-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="dashboard-panel__header">
                <div className="dashboard-panel__title-wrap">
                  <span className="dashboard-panel__icon">
                    <i className="bi bi-lightbulb-fill"></i>
                  </span>
                  <div>
                    <span className="dashboard-panel__eyebrow">Weekly Insight</span>
                    <h3 className="dashboard-panel__title">Patterns worth noticing</h3>
                  </div>
                </div>
                <Link
                  to="/mood-checkin"
                  className="dashboard-panel__action"
                >
                  <i className="bi bi-arrow-right"></i>
                  Open Mood Check-In
                </Link>
              </div>

              <div className="dashboard-panel__content">
                {hasMoodData && weeklyAnalysis && insights ? (
                  <>
                    <div className="dashboard-insight-summary">
                      <div className="dashboard-insight-meter">
                        <span className="dashboard-insight-meter__label">Weekly score</span>
                        <strong className="dashboard-insight-meter__value">{averageMood}/5</strong>
                      </div>
                      <div className="dashboard-insight-copy">
                        <p className="dashboard-insight-main">{insights.main}</p>
                      </div>
                    </div>

                    <div className="dashboard-insight-pills">
                      {insights.actionItems.map((item, idx) => (
                        <span key={idx} className="dashboard-insight-pill">
                          {item}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="dashboard-empty-state">
                    <i className="bi bi-emoji-neutral"></i>
                    <p>Complete your mood check-in to see personalized insights.</p>
                  </div>
                )}
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

      {showUpcomingPlans && (
        <motion.div
          className="modal-backdrop-custom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowUpcomingPlans(false)}
        >
          <motion.div
            className="modal-content-custom upcoming-plans-modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-custom">
              <h4 className="mb-0">
                <i className="bi bi-calendar2-week me-2"></i>
                Upcoming Plans
              </h4>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowUpcomingPlans(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body-custom">
              {upcomingPlans.length > 0 ? (
                <div className="upcoming-plans-list">
                  {upcomingPlans.map((plan) => {
                    const planDate = new Date(plan.date);
                    return (
                      <button
                        key={plan._id}
                        type="button"
                        className="upcoming-plan-item"
                        onClick={() => {
                          setShowUpcomingPlans(false);
                          navigate(`/schedule/item/${plan._id}`);
                        }}
                      >
                        <div className="upcoming-plan-item__head">
                          <div>
                            <div className="upcoming-plan-item__title">{plan.title}</div>
                            <div className="upcoming-plan-item__meta">
                              <span>
                                <i className="bi bi-calendar3"></i>
                                {planDate.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>
                                <i className="bi bi-clock"></i>
                                {plan.time || "All day"}
                              </span>
                            </div>
                          </div>
                          <span className={`priority-badge priority-${plan.priority?.toLowerCase() || "medium"}`}>
                            {plan.priority || "Medium"}
                          </span>
                        </div>

                        {plan.description && (
                          <p className="upcoming-plan-item__description">
                            {plan.description}
                          </p>
                        )}

                        <div className="upcoming-plan-item__footer">
                          <span className="upcoming-plan-item__category">{plan.category || "General"}</span>
                          <span className="upcoming-plan-item__open">
                            Open
                            <i className="bi bi-arrow-right"></i>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="dashboard-empty-state upcoming-plans-empty">
                  <i className="bi bi-calendar-x"></i>
                  <p>No upcoming plans yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
