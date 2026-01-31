import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../contexts/ToastContext";
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
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

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
    { day: "monday", emoji: "😀", label: "Happy" },
    { day: "tuesday", emoji: "😐", label: "Neutral" },
    { day: "wednesday", emoji: "😔", label: "Sad" },
    { day: "thursday", emoji: "😊", label: "Happy" },
    { day: "friday", emoji: "😩", label: "Tired" },
    { day: "saturday", emoji: "🤩", label: "Excited" },
    { day: "sunday", emoji: "😎", label: "Relaxed" },
  ]);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await fetch("https://api.quotable.io/random");
      const data = await response.json();
      setQuote({
        text: data.content,
        author: data.author.split(",")[0],
      });
    } catch (err) {
      // Keep default quote
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
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
      const res = await API.post("/diary", {
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
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const cycleMood = (i) => {
    setMoodRow((prev) =>
      prev.map((m, idx) => {
        if (idx === i) {
          const nextIndex = (moods.findIndex((mood) => mood.emoji === m.emoji) + 1) % moods.length;
          return { ...m, ...moods[nextIndex] };
        }
        return m;
      })
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
              className="card border-0"
              style={{
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)'
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="card-body p-0" style={{ position: 'relative' }}>
                {/* Gradient accent bar */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                  borderTopRightRadius: '8px',
                  borderBottomRightRadius: '8px'
                }}></div>

                {/* Calendar Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '16px 20px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <i className="bi bi-calendar3" style={{ fontSize: '20px', opacity: '0.9' }}></i>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Calendar</span>
                </div>

                {/* Calendar Content */}
                <div style={{ padding: '20px' }}>
                  {/* Month Navigation */}
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <button
                      className="btn btn-link text-muted p-0"
                      onClick={previousMonth}
                      style={{ textDecoration: 'none', fontSize: '16px', color: '#667eea' }}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <span style={{ color: '#1e293b', fontSize: '15px', fontWeight: '600', minWidth: '120px', textAlign: 'center' }}>{monthName}</span>
                    <button
                      className="btn btn-link text-muted p-0"
                      onClick={nextMonth}
                      style={{ textDecoration: 'none', fontSize: '16px', color: '#667eea' }}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>

                  {/* Calendar Label Card */}
                  <div className="calendar-label-card mb-3" style={{ margin: '0 0 16px 0' }}>
                  <div className="calendar-rings">
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                  </div>
                  <div className="calendar-label-text">CALENDAR</div>
                </div>

                <div className="calendar-grid" style={{ margin: '0 0 0 0' }}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="calendar-day-header">
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, i) => (
                    <div
                      key={i}
                      className={`calendar-day ${
                        day === selectedDate ? "active" : ""
                      } ${!day ? "empty" : ""}`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                </div>
              </div>
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
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                marginTop: '20px'
              }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="card-body p-0">
                {/* Mood Tracker Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '16px 24px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <i className="bi bi-emoji-smile" style={{ fontSize: '20px', opacity: '0.9' }}></i>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>This Week's Mood</span>
                </div>

                {/* Mood Content */}
                <div style={{ padding: '24px' }}>
                  <div className="d-flex gap-3 justify-content-between mood-container" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
                    {moodRow.map((mood, i) => (
                    <motion.div
                      key={i}
                      className="mood-item text-center cursor-pointer"
                      onClick={() => cycleMood(i)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}
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
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.border = "3px solid #667eea"
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
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
                    </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mood Analysis Card */}
            <motion.div
              className="card border-0 mt-4"
              style={{
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)'
              }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="card-body p-0">
                {/* Header with gradient */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '20px',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h6 className="mb-0" style={{ color: 'white', fontWeight: '600' }}>
                    <i className="bi bi-graph-up me-2"></i>
                    Mood Analysis
                  </h6>
                  <span style={{ fontSize: '12px', opacity: '0.9' }}>This Week</span>
                </div>

                <div className="mood-analysis-container" style={{ padding: '20px' }}>
                  {/* Overall Mood Indicator */}
                  <div className="mood-overall-stat mb-4" style={{
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    padding: '15px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>😊</div>
                    <div style={{ fontSize: '13px', color: '#6b5b42', fontWeight: '600' }}>Overall Mood: Happy</div>
                    <div style={{ fontSize: '11px', color: '#8b7355', marginTop: '4px' }}>Based on 7 entries</div>
                  </div>

                  <div className="mood-stat mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="mood-stat-label">😊 Happy</span>
                      <span className="mood-stat-value">35%</span>
                    </div>
                    <div className="mood-progress-bar">
                      <motion.div 
                        className="mood-progress-fill" 
                        style={{ background: 'linear-gradient(90deg, #ffc107, #ff9800)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '35%' }}
                        transition={{ duration: 0.8 }}
                      ></motion.div>
                    </div>
                  </div>

                  <div className="mood-stat mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="mood-stat-label">😌 Calm</span>
                      <span className="mood-stat-value">25%</span>
                    </div>
                    <div className="mood-progress-bar">
                      <motion.div 
                        className="mood-progress-fill" 
                        style={{ background: 'linear-gradient(90deg, #17a2b8, #20c997)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '25%' }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      ></motion.div>
                    </div>
                  </div>

                  <div className="mood-stat mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="mood-stat-label">😔 Sad</span>
                      <span className="mood-stat-value">20%</span>
                    </div>
                    <div className="mood-progress-bar">
                      <motion.div 
                        className="mood-progress-fill" 
                        style={{ background: 'linear-gradient(90deg, #6c757d, #495057)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '20%' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      ></motion.div>
                    </div>
                  </div>

                  <div className="mood-stat mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="mood-stat-label">😰 Anxious</span>
                      <span className="mood-stat-value">15%</span>
                    </div>
                    <div className="mood-progress-bar">
                      <motion.div 
                        className="mood-progress-fill" 
                        style={{ background: 'linear-gradient(90deg, #dc3545, #c82333)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '15%' }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      ></motion.div>
                    </div>
                  </div>

                  <div className="mood-stat mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="mood-stat-label">😡 Angry</span>
                      <span className="mood-stat-value">5%</span>
                    </div>
                    <div className="mood-progress-bar">
                      <motion.div 
                        className="mood-progress-fill" 
                        style={{ background: 'linear-gradient(90deg, #fd7e14, #e76a3d)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '5%' }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      ></motion.div>
                    </div>
                  </div>

                  {/* Mood Insights */}
                  <motion.div 
                    style={{
                      marginTop: '24px',
                      padding: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                    }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-lightbulb-fill" style={{ fontSize: '18px' }}></i>
                      Daily Insight
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.6', fontWeight: '400' }}>
                      You've been mostly happy this week! Keep maintaining your positive outlook and try to manage stress during anxious moments.
                    </div>
                  </motion.div>
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
