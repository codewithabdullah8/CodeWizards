// DayTrack-style Dashboard (fixed & stable)

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../contexts/ToastContext";
import API from "../api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  /* =======================
     REQUIRED STATES (FIXED)
     ======================= */
  const [creating, setCreating] = useState(false);
  const [creatingSaving, setCreatingSaving] = useState(false);
  const [createTitle, setCreateTitle] = useState(location.state?.title || "");
  const [createContent, setCreateContent] = useState("");
  const [createMusic, setCreateMusic] = useState("none");
  const [createError, setCreateError] = useState("");

  const [recentEntries, setRecentEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState("");

  const [quickTitles, setQuickTitles] = useState([]);
  const [query, setQuery] = useState("");

  const [stats, setStats] = useState({
    totalEntries: 0,
    todayEntries: 0,
    weekEntries: 0,
    avgMood: 0,
  });

  const now = new Date();

  /* =======================
     CHART DATA
     ======================= */
  const chartData = useMemo(
    () => [
      { name: "Total", value: stats.totalEntries, color: "#0d6efd" },
      { name: "This Week", value: stats.weekEntries, color: "#198754" },
      { name: "Today", value: stats.todayEntries, color: "#ffc107" },
    ],
    [stats]
  );

  const moodData = [
    { name: "Happy", value: 40, color: "#ffd700" },
    { name: "Neutral", value: 30, color: "#adb5bd" },
    { name: "Sad", value: 20, color: "#6ea8fe" },
    { name: "Excited", value: 10, color: "#ff6ec7" },
  ];

  /* =======================
     MOOD TRACKER
     ======================= */
  const moods = [
    { emoji: "😀", label: "Happy" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😩", label: "Tired" },
    { emoji: "🤩", label: "Excited" },
    { emoji: "😎", label: "Relaxed" },
  ];

  const [moodRow, setMoodRow] = useState([
    { day: "Mon", index: 0 },
    { day: "Tue", index: 1 },
    { day: "Wed", index: 2 },
    { day: "Thu", index: 0 },
    { day: "Fri", index: 3 },
    { day: "Sat", index: 4 },
    { day: "Sun", index: 5 },
  ]);

  function cycleMood(i) {
    setMoodRow((prev) =>
      prev.map((m, idx) =>
        idx === i
          ? { ...m, index: (m.index + 1) % moods.length }
          : m
      )
    );
  }

  /* =======================
     LOAD DATA
     ======================= */
  useEffect(() => {
    setLoadingEntries(true);
    setError("");

    API.get("/diary?limit=10")
      .then(({ data }) => {
        setRecentEntries(Array.isArray(data) ? data : data.entries || []);
      })
      .catch(() => setError("Failed to load entries"))
      .finally(() => setLoadingEntries(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("diary_title_history");
      setQuickTitles(raw ? JSON.parse(raw) : []);
    } catch {
      setQuickTitles([]);
    }
  }, []);

  useEffect(() => {
    API.get("/diary")
      .then(({ data }) => {
        const entries = Array.isArray(data) ? data : data.entries || [];
        const today = new Date();
        const startToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const weekAgo = new Date(startToday.getTime() - 7 * 86400000);

        setStats({
          totalEntries: entries.length,
          todayEntries: entries.filter(
            (e) => new Date(e.createdAt) >= startToday
          ).length,
          weekEntries: entries.filter(
            (e) => new Date(e.createdAt) >= weekAgo
          ).length,
          avgMood: 0,
        });
      })
      .catch(() => {});
  }, []);

  /* =======================
     CREATE ENTRY
     ======================= */
  async function handleCreateSubmit(e) {
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

      const entry = res.data;
      setRecentEntries((prev) => [entry, ...prev].slice(0, 10));

      setCreateTitle("");
      setCreateContent("");
      setCreateMusic("none");
      setCreating(false);

      addToast("Entry created successfully!", "success");
      navigate(`/entry/${entry._id}`);
    } catch (err) {
      setCreateError("Failed to create entry");
    } finally {
      setCreatingSaving(false);
    }
  }

  /* =======================
     UI
     ======================= */
  return (
    <motion.div className="dashboard-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* STATS */}
      <div className="row g-4 mb-4">
        {chartData.map((item, i) => (
          <div className="col-md-4" key={i}>
            <div className="card text-center p-4">
              <h6 className="text-muted">{item.name}</h6>
              <h2 style={{ color: item.color }}>{item.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card p-3">
            <h6>Entries Overview</h6>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0d6efd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h6>Mood Distribution</h6>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={moodData} dataKey="value" outerRadius={70}>
                  {moodData.map((m, i) => (
                    <Cell key={i} fill={m.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MOOD TRACKER */}
      <div className="card p-3 mb-4">
        <h6>This Week’s Mood</h6>
        <div className="d-flex gap-3 flex-wrap">
          {moodRow.map((m, i) => (
            <div
              key={i}
              className="mood-pill"
              onClick={() => cycleMood(i)}
              style={{ cursor: "pointer" }}
            >
              <div>{m.day}</div>
              <div style={{ fontSize: "1.5rem" }}>
                {moods[m.index].emoji}
              </div>
              <small>{moods[m.index].label}</small>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {creating && (
          <motion.div className="modal-backdrop-custom" onClick={() => setCreating(false)}>
            <motion.div
              className="modal-content-custom"
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Create Entry</h4>
              <form onSubmit={handleCreateSubmit}>
                <input
                  className="form-control mb-2"
                  placeholder="Title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                />
                <textarea
                  className="form-control mb-2"
                  rows="4"
                  placeholder="Content"
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                />
                {createError && <div className="alert alert-danger">{createError}</div>}
                <button className="btn btn-primary" disabled={creatingSaving}>
                  {creatingSaving ? "Saving..." : "Save"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
