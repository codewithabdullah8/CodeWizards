import React, { useState, useEffect } from "react";
import { saveMood, getHistoricalAnalysis } from "../api/mood";
import { motion } from "framer-motion";

export default function MoodCheckin() {
  const emotions = [
    { label: "😌 Calm", value: "calm", color: "#60a5fa" },
    { label: "😐 Normal", value: "normal", color: "#94a3b8" },
    { label: "😔 Low", value: "low", color: "#a78bfa" },
    { label: "😡 Irritated", value: "irritated", color: "#f87171" },
    { label: "😴 Exhausted", value: "exhausted", color: "#fb923c" },
  ];

  const [answers, setAnswers] = useState({
    energy: 3,
    stress: 3,
    positivity: 3,
    focus: 3,
    sleep: 3,
    emotion: "normal",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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

  // Load historical analyses on component mount
  useEffect(() => {
    loadHistory();

    // Listen for mood check-in success to update history
    const handleMoodSuccess = () => {
      loadHistory();
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

  // handle slider change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers({ ...answers, [name]: Number(value) });
  };

  // handle emotion MCQ
  const handleEmotion = (emotion) => {
    setAnswers({ ...answers, emotion });
  };

  // submit mood
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await saveMood({ answers });
      setResult(res.data);
      
      // Dispatch event to notify Dashboard to refresh weekly moods
      window.dispatchEvent(new CustomEvent("mood-check-in-success", { 
        detail: res.data 
      }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save mood");
    } finally {
      setLoading(false);
    }
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
          🧠 Mood Check-in
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Answer honestly. It takes less than a minute.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
        style={{ marginBottom: "30px" }}
      >
        <div className="card-body" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit}>
            {/* ENERGY */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "10px",
                fontSize: "1rem",
              }}>
                ⚡ How energetic did you feel today?
                <span style={{
                  marginLeft: "10px",
                  color: "#3b82f6",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}>
                  {answers.energy}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                name="energy"
                value={answers.energy}
                onChange={handleChange}
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "5px",
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(answers.energy - 1) * 25}%, #e2e8f0 ${(answers.energy - 1) * 25}%, #e2e8f0 100%)`,
                  outline: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "5px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}>
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* STRESS */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "10px",
                fontSize: "1rem",
              }}>
                😰 How stressed were you today?
                <span style={{
                  marginLeft: "10px",
                  color: "#8b5cf6",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}>
                  {answers.stress}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                name="stress"
                value={answers.stress}
                onChange={handleChange}
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "5px",
                  background: `linear-gradient(to right, #f87171 0%, #f87171 ${(answers.stress - 1) * 25}%, #e2e8f0 ${(answers.stress - 1) * 25}%, #e2e8f0 100%)`,
                  outline: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "5px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}>
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* POSITIVITY */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "10px",
                fontSize: "1rem",
              }}>
                ✨ Overall, how positive was your day?
                <span style={{
                  marginLeft: "10px",
                  color: "#10b981",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}>
                  {answers.positivity}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                name="positivity"
                value={answers.positivity}
                onChange={handleChange}
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "5px",
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(answers.positivity - 1) * 25}%, #e2e8f0 ${(answers.positivity - 1) * 25}%, #e2e8f0 100%)`,
                  outline: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "5px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}>
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* FOCUS */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "10px",
                fontSize: "1rem",
              }}>
                🎯 How focused or motivated were you?
                <span style={{
                  marginLeft: "10px",
                  color: "#f59e0b",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}>
                  {answers.focus}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                name="focus"
                value={answers.focus}
                onChange={handleChange}
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "5px",
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(answers.focus - 1) * 25}%, #e2e8f0 ${(answers.focus - 1) * 25}%, #e2e8f0 100%)`,
                  outline: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "5px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}>
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* SLEEP */}
            <div style={{ marginBottom: "30px" }}>
              <label style={{
                display: "block",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "10px",
                fontSize: "1rem",
              }}>
                😴 How was your sleep last night?
                <span style={{
                  marginLeft: "10px",
                  color: "#6366f1",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}>
                  {answers.sleep}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                name="sleep"
                value={answers.sleep}
                onChange={handleChange}
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "5px",
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(answers.sleep - 1) * 25}%, #e2e8f0 ${(answers.sleep - 1) * 25}%, #e2e8f0 100%)`,
                  outline: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "5px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}>
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* EMOTION MCQ */}
            <div style={{ marginBottom: "30px" }}>
              <p style={{
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "15px",
                fontSize: "1rem",
              }}>
                💭 Which best describes your emotional state?
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {emotions.map((emo) => (
                  <motion.button
                    type="button"
                    key={emo.value}
                    onClick={() => handleEmotion(emo.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "12px 20px",
                      borderRadius: "12px",
                      border: answers.emotion === emo.value ? `2px solid ${emo.color}` : "2px solid var(--border-color)",
                      background: answers.emotion === emo.value
                        ? emo.color
                        : "var(--bg-primary)",
                      color: answers.emotion === emo.value ? "#fff" : "var(--text-primary)",
                      fontWeight: "600",
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: answers.emotion === emo.value
                        ? `0 4px 12px ${emo.color}40`
                        : "none",
                    }}
                  >
                    {emo.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: loading
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                color: "#fff",
                fontWeight: "600",
                fontSize: "1.1rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: loading ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              {loading ? "✨ Saving..." : "🚀 Submit Mood Check-in"}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* RESULT */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card"
          style={{ marginBottom: "30px" }}
        >
          <div className="card-body" style={{ padding: "2rem" }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{ fontSize: "2rem" }}>{moodEmoji[result.mood] || "😊"}</span>
              Your mood today: <span style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{result.mood}</span>
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px" }}>
                💡 Possible reasons:
              </p>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)" }}>
                {result.reasons.map((r, i) => (
                  <li key={i} style={{ marginBottom: "5px" }}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{ fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px" }}>
                💪 Suggestions:
              </p>
              <ul style={{ paddingLeft: "20px", color: "var(--text-secondary)" }}>
                {result.suggestions.map((s, i) => (
                  <li key={i} style={{ marginBottom: "5px" }}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

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
          📊 Weekly Mood History
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
              No historical data yet. Complete a full week to see your mood history!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {history.map((week, idx) => {
              const startDate = new Date(week.startDate);
              const endDate = new Date(week.endDate);
              const dateRange = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
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
                          Week {week.weekId} • {dateRange}
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
        )}
      </motion.div>
    </div>
  );
}