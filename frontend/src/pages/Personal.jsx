import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalAPI from '../api/personal';

export default function Personal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [moodAnswers, setMoodAnswers] = useState({
    energy: 3,
    stress: 3,
    positivity: 3,
    focus: 3,
    sleep: 3,
  });

  const moodQuestions = [
    { key: 'energy', label: '⚡ Energy' },
    { key: 'stress', label: '😰 Stress' },
    { key: 'positivity', label: '✨ Positivity' },
    { key: 'focus', label: '🎯 Focus' },
    { key: 'sleep', label: '😴 Sleep' },
  ];



  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await PersonalAPI.getEntries();
      setEntries(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await PersonalAPI.deleteEntry(id);
      setEntries(entries.filter(e => e._id !== id));
      // notify recent entries component to refresh
      window.dispatchEvent(new Event('refreshRecentEntries'));
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  if (loading) return (
    <div className="container py-5">
      <motion.div 
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div 
            className="spinner-border text-primary mb-3"
            style={{ width: '3rem', height: '3rem' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <span className="visually-hidden">Loading...</span>
          </motion.div>
          <h5 className="text-muted">Loading your personal diary...</h5>
        </div>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="container py-5">
      <motion.div 
        className="alert alert-danger d-flex align-items-center justify-content-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transitnpm run ion={{ duration: 0.5 }}
      >
        <i className="bi bi-exclamation-triangle me-3 fs-4"></i>
        <div>
          <h5 className="mb-1">Error Loading Diary</h5>
          <p className="mb-0">{error}</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      className="container py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <motion.div 
            className="text-center mb-5"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="page-header display-4 mb-3">
              <i className="bi bi-heart me-3"></i>
              Personal Diary
            </h1>
            <p className="text-muted fs-5">Your private space for thoughts and memories</p>
          </motion.div>

          <AnimatePresence>
            {selectedEntry && (
              <motion.div 
                className="card diary-entry-card mb-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="card-title text-primary mb-0">{selectedEntry.title}</h3>
                    <button
                      className="btn-close"
                      onClick={() => setSelectedEntry(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-2"></i>
                      {new Date(selectedEntry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                  <p className="card-text fs-5 lh-base">{selectedEntry.content}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCreate && (
              <motion.div 
                className="card shadow-lg mb-4"
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                  border: '2px solid #3b82f6',
                  borderRadius: '16px',
                }}
              >
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" style={{ borderRadius: '14px 14px 0 0' }}>
                  <h4 className="mb-0">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create New Personal Entry
                  </h4>
                  <button
                    className="btn btn-sm btn-light"
                    onClick={() => setShowCreate(false)}
                    title="Cancel"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="card-body" style={{ padding: '2rem' }}>
                  <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const payload = {
                      title: form.title.value,
                      content: form.content.value,
                      energy: moodAnswers.energy,
                      stress: moodAnswers.stress,
                      positivity: moodAnswers.positivity,
                      focus: moodAnswers.focus,
                      sleep: moodAnswers.sleep,
                    };

                    try {
                      const { data } = await PersonalAPI.createEntry(payload);
                      setEntries([data, ...entries]);
                      // refresh recent entries immediately
                      window.dispatchEvent(new Event('refreshRecentEntries'));
                      setShowCreate(false);
                      setMoodAnswers({
                        energy: 3,
                        stress: 3,
                        positivity: 3,
                        focus: 3,
                        sleep: 3,
                      });
                      form.reset();
                    } catch (err) {
                      alert("Failed to create entry");
                    }
                  }}
                >
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="bi bi-tag me-2"></i>
                      Entry Title
                    </label>
                    <input
                      name="title"
                      className="form-control form-control-lg"
                      placeholder="Give your entry a meaningful title..."
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="bi bi-pencil me-2"></i>
                      Your Thoughts
                    </label>
                    <textarea
                      name="content"
                      className="form-control"
                      placeholder="Write your personal thoughts, experiences, or reflections here..."
                      rows="6"
                      required
                    />
                  </div>

                  {/* MOOD CHECK-IN QUESTIONS (OPTIONAL) */}
                  <div className="mb-4 p-4 rounded personal-mood-questions">
                    <h5 className="text-primary mb-4">
                      <i className="bi bi-emoji-smile me-2"></i>
                      How are you feeling today?
                      <span className="text-muted ms-2" style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>(Optional)</span>
                    </h5>

                    {/* MOOD QUESTIONS GRID */}
                    <div className="personal-mood-grid">
                      {moodQuestions.map(({ key, label }) => (
                        <div key={key} className="personal-mood-item">
                          <label className="form-label fw-bold text-center d-block mb-2">
                            {label}
                          </label>
                          <div className="personal-mood-slider-wrap">
                            <span className="personal-mood-scale">5</span>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              step="1"
                              value={moodAnswers[key]}
                              onChange={(e) =>
                                setMoodAnswers((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                              }
                              className="personal-mood-slider"
                              aria-label={`${label} level`}
                            />
                            <span className="personal-mood-scale">1</span>
                          </div>
                          <div className="personal-mood-value">{moodAnswers[key]}/5</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex gap-3 justify-content-end">
                    <motion.button 
                      className="btn btn-outline-secondary px-4"
                      type="button"
                      onClick={() => setShowCreate(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </motion.button>
                    <motion.button 
                      className="btn btn-primary px-4"
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Save Entry
                    </motion.button>
                  </div>
                </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showCreate && (
            <motion.div 
              className="d-flex justify-content-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.button
                className="btn btn-primary btn-lg px-5 py-3"
                onClick={() => setShowCreate(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="bi bi-plus-circle me-2 fs-5"></i>
                New Personal Entry
              </motion.button>
            </motion.div>
          )}

          {entries.length === 0 ? (
            <motion.div 
              className="text-center py-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="mb-4">
                <i className="bi bi-journal-x display-1 text-muted"></i>
              </div>
              <h4 className="text-muted mb-3">No personal entries yet</h4>
              <p className="text-muted mb-4 fs-5">
                Start your personal journey by creating your first diary entry using the button above.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="row g-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {entries.map((entry, index) => (
                <motion.div 
                  key={entry._id} 
                  className="col-12 col-md-6 col-lg-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.4 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="card diary-entry-card h-100 shadow-sm" style={{ transition: 'all 0.3s ease' }}>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title text-primary mb-0" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '1.1rem'
                        }}>{entry.title}</h5>
                      </div>
                      <small className="text-muted mb-3">
                        <i className="bi bi-calendar-event me-1"></i>
                        {new Date(entry.date).toLocaleDateString()}
                      </small>
                      <p className="card-text text-muted mb-3 flex-grow-1" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '80px'
                      }}>
                        {entry.content}
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex gap-2">
                            <motion.button
                              className="btn btn-outline-primary btn-sm px-3"
                              onClick={() => setSelectedEntry(entry)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
                            </motion.button>
                            <motion.button 
                              onClick={() => deleteEntry(entry._id)} 
                              className="btn btn-outline-danger btn-sm px-3"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <i className="bi bi-trash me-1"></i>
                            </motion.button>
                          </div>
                        </div>
                        <small className="text-muted d-block text-end">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(entry.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}