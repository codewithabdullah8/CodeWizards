// src/pages/Dashboard.jsx
// Dashboard with inline "Create new entry" form + recent entries + quick titles

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { EntrySkeleton } from '../components/Skeleton';
import API from '../api';

export default function Dashboard() {
  const [recentEntries, setRecentEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState('');
  const [quickTitles, setQuickTitles] = useState([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Create form state
  const [creating, setCreating] = useState(false);
  const [createTitle, setCreateTitle] = useState(location.state?.title || '');
  const [createContent, setCreateContent] = useState('');
  const [createMusic, setCreateMusic] = useState('none');
  const [createError, setCreateError] = useState('');
  const [creatingSaving, setCreatingSaving] = useState(false);

  // load recent diary entries from server
  useEffect(() => {
    let mounted = true;
    setLoadingEntries(true);
    setError('');
    API.get('/diary?limit=10')
      .then(({ data }) => {
        if (!mounted) return;
        setRecentEntries(Array.isArray(data) ? data : (data.entries || []));
      })
      .catch(() => {
        setError('Could not load recent entries');
        setRecentEntries([]);
      })
      .finally(() => {
        if (mounted) setLoadingEntries(false);
      });
    return () => { mounted = false; };
  }, []);

  // load quick titles from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('diary_title_history');
      setQuickTitles(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setQuickTitles([]);
    }
  }, []);

  function saveQuickTitleLocally(title) {
    if (!title || !title.trim()) return;
    try {
      const key = 'diary_title_history';
      const arr = JSON.parse(localStorage.getItem(key)) || [];
      const next = [title.trim(), ...arr.filter(x => x !== title.trim())].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
      setQuickTitles(next);
    } catch (e) {
      // ignore
    }
  }

  function removeQuickTitle(title) {
    const next = quickTitles.filter(t => t !== title);
    setQuickTitles(next);
    try { localStorage.setItem('diary_title_history', JSON.stringify(next)); } catch (e) {}
  }

  function clearQuickTitles() {
    setQuickTitles([]);
    try { localStorage.removeItem('diary_title_history'); } catch (e) {}
  }

  function handleCreateFromQuick(title) {
    // if user clicks quick title to create, open create form prefilled
    setCreateTitle(title);
    setCreateContent('');
    setCreateMusic('none');
    setCreating(true);
    // scroll into view a little
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filteredEntries = recentEntries.filter(e =>
    !query.trim() ||
    (e.title && e.title.toLowerCase().includes(query.toLowerCase())) ||
    (e.content && e.content.toLowerCase().includes(query.toLowerCase()))
  );

  async function handleCreateSubmit(e) {
    e?.preventDefault?.();
    setCreateError('');

    if (!createTitle.trim()) {
      setCreateError('Title is required');
      return;
    }
    if (!createContent.trim()) {
      setCreateError('Content is required');
      return;
    }

    setCreatingSaving(true);

    try {
      const payload = {
        title: createTitle,
        content: createContent,
        ...(createMusic !== 'none' ? { musicKey: createMusic } : {}),
      };

      // 🔴 IMPORTANT: this assumes your backend has POST /diary
      // If your existing "add entry" route is different (e.g. /diary/add),
      // change '/diary' here to that exact path.
      const res = await API.post('/diary', payload);
      const created = res?.data;

      // optimistic update: prepend to recentEntries
      const entryToInsert = created && (created._id || created.id)
        ? created
        : { ...payload, createdAt: new Date().toISOString(), _id: `local-${Date.now()}` };

      setRecentEntries(prev => [entryToInsert, ...prev].slice(0, 20));

      // save title locally for quick titles
      saveQuickTitleLocally(createTitle);

      // clear form
      setCreateTitle('');
      setCreateContent('');
      setCreateMusic('none');
      setCreating(false);

      addToast('Entry created successfully!', 'success');

      // navigate to new entry page if we have an id from server
      const newId = (created && (created._id || created.id));
      if (newId) navigate(`/entry/${created._id || created.id}`);
    } catch (err) {
      console.error('Create entry failed:', err);

      if (err?.message === 'Network Error') {
        setCreateError(
          'Network error: could not reach the backend. ' +
          'Check that your Node/Express server is running and the API base URL in api.js is correct.'
        );
      } else {
        setCreateError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Create failed'
        );
      }
    } finally {
      setCreatingSaving(false);
    }
  }

  return (
    <motion.div 
      className="container py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-12">
          <motion.div 
            className="text-center mb-5"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="page-header display-4 mb-3">
              <i className="bi bi-house-door me-3"></i>
              Dashboard
            </h1>
            <p className="text-muted fs-5">Your personal diary overview and quick actions</p>
          </motion.div>

          <motion.div 
            className="d-flex justify-content-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.button
              className="btn btn-primary btn-lg px-5 py-3"
              onClick={() => {
                setCreating(c => !c);
                if (!creating) window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="bi bi-plus-circle me-2 fs-5"></i>
              {creating ? 'Close Form' : 'Create New Entry'}
            </motion.button>
          </motion.div>

          {/* Inline create form */}
          <AnimatePresence>
            {creating && (
              <motion.div 
                className="create-form mb-5"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 text-primary">
                    <i className="bi bi-pencil-square me-2"></i>
                    Create New Diary Entry
                  </h4>
                  <button
                    className="icon-btn btn btn-outline-secondary"
                    onClick={() => setCreating(false)}
                    title="Close form"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit}>
                  <div className="row g-4">
                    <div className="col-md-8">
                      <label htmlFor="create-title" className="form-label fw-bold">
                        <i className="bi bi-tag me-2"></i>
                        Entry Title <span className="text-danger">*</span>
                      </label>
                      <input
                        id="create-title"
                        className="form-control form-control-lg"
                        value={createTitle}
                        onChange={(e) => setCreateTitle(e.target.value)}
                        placeholder="Give your entry a meaningful title..."
                        autoComplete="off"
                        required
                      />
                      <div className="mt-3 d-flex flex-wrap gap-2">
                        {['Morning reflection', 'Gratitude', 'Work notes', 'Evening thoughts'].map((ex, i) => (
                          <motion.button
                            type="button"
                            key={i}
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setCreateTitle(ex)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {ex}
                          </motion.button>
                        ))}
                        <motion.button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            if (createTitle.trim()) saveQuickTitleLocally(createTitle.trim());
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="bi bi-star me-1"></i>
                          Save Title
                        </motion.button>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="create-music" className="form-label fw-bold">
                        <i className="bi bi-music-note me-2"></i>
                        Ambient Music
                      </label>
                      <select
                        id="create-music"
                        className="form-select form-select-lg"
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
                  </div>

                  <div className="mt-4">
                    <label htmlFor="create-content" className="form-label fw-bold">
                      <i className="bi bi-journal-text me-2"></i>
                      Your Thoughts <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="create-content"
                      rows={8}
                      className="form-control"
                      value={createContent}
                      onChange={(e) => setCreateContent(e.target.value)}
                      placeholder="Write your diary entry here... What happened today? How do you feel? What are you grateful for?"
                      required
                    />
                    <div className="mt-3 d-flex flex-wrap gap-2">
                      {['Today I felt grateful for...', 'Something important happened:', 'I learned that...'].map((ex, i) => (
                        <motion.button
                          type="button"
                          key={i}
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setCreateContent(ex)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {ex}
                        </motion.button>
                      ))}
                      <motion.button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setCreateContent('')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Clear
                      </motion.button>
                    </div>
                  </div>

                  {createError && (
                    <motion.div 
                      className="alert alert-danger d-flex align-items-center mt-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <i className="bi bi-exclamation-triangle me-3 fs-5"></i>
                      <div>
                        <h6 className="mb-1">Please check your input</h6>
                        <p className="mb-0">{createError}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="d-flex gap-3 justify-content-end mt-4">
                    <motion.button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => setCreating(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </motion.button>
                    <motion.button
                      className="btn btn-primary px-4 d-flex align-items-center"
                      disabled={creatingSaving || !createTitle.trim() || !createContent.trim()}
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {creatingSaving ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                          Creating Entry...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Save Entry
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="row g-4">
            {/* Recent entries (main column) */}
            <div className="col-lg-8">
              <motion.div
                className="card professional-card h-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-journal-text text-primary me-3 fs-4"></i>
                      <div>
                        <h4 className="mb-0 fw-bold">Recent Entries</h4>
                        <p className="text-muted mb-0 small">Your latest diary reflections</p>
                      </div>
                      <span className="badge bg-primary ms-3 rounded-pill fs-6">{filteredEntries.length}</span>
                    </div>
                    <div style={{ minWidth: 250 }}>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-search text-primary"></i>
                        </span>
                        <input
                          className="form-control border-start-0"
                          placeholder="Search your entries..."
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {loadingEntries ? (
                    <div className="row g-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="col-12">
                          <EntrySkeleton />
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <motion.div
                      className="alert alert-warning d-flex align-items-center justify-content-center py-5"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <i className="bi bi-exclamation-triangle me-3 fs-3"></i>
                      <div>
                        <h5 className="mb-1">Unable to Load Entries</h5>
                        <p className="mb-0">{error}</p>
                      </div>
                    </motion.div>
                  ) : filteredEntries.length === 0 ? (
                    <motion.div
                      className="text-center py-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <div className="mb-4">
                        <i className="bi bi-journal-x display-1 text-muted"></i>
                      </div>
                      <h4 className="text-muted mb-3">No entries found</h4>
                      <p className="text-muted mb-4 fs-5">
                        {query.trim() ? 'Try adjusting your search terms' : 'Start your diary journey by creating your first entry'}
                      </p>
                      <motion.button
                        className="btn btn-primary btn-lg px-5 py-3"
                        onClick={() => {
                          setCreating(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Your First Entry
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="row g-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      {filteredEntries.map((it, index) => (
                        <motion.div
                          key={it._id || it.id || it.createdAt}
                          className="col-12"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div
                            className="diary-entry-card p-4 cursor-pointer h-100"
                            onClick={() => navigate(`/entry/${it._id || it.id}`)}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="flex-grow-1 me-3">
                                <h5 className="mb-2 fw-bold text-primary">
                                  <i className="bi bi-file-earmark-text me-2"></i>
                                  {it.title || '(untitled)'}
                                </h5>
                                <p className="text-muted mb-3" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: '1.6'
                                }}>
                                  {(it.content || '').slice(0, 250)}
                                </p>
                              </div>
                              <div className="text-end">
                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    <i className="bi bi-calendar-event me-1"></i>
                                    {new Date(it.createdAt).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </small>
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {new Date(it.createdAt).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </small>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex gap-2 flex-wrap">
                                {it.musicKey && it.musicKey !== 'none' && (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2">
                                    <i className="bi bi-music-note me-1"></i>
                                    {it.musicKey === 'calm' ? '🌊 Calm' : 
                                     it.musicKey === 'focus' ? '🎯 Focus' : 
                                     it.musicKey === 'rain' ? '🌧️ Rain' : 
                                     it.musicKey === 'nature' ? '🌿 Nature' : it.musicKey}
                                  </span>
                                )}
                                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2">
                                  <i className="bi bi-eye me-1"></i>
                                  View Entry
                                </span>
                              </div>
                              <i className="bi bi-chevron-right text-primary fs-5"></i>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick titles (side column) */}
            <div className="col-lg-4" style={{ position: 'sticky', top: '20px' }}>
              <motion.div
                className="card professional-card h-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-lightning-charge text-warning me-3 fs-4"></i>
                      <div>
                        <h4 className="mb-0 fw-bold">Quick Titles</h4>
                        <p className="text-muted mb-0 small">Saved titles for quick entry creation</p>
                      </div>
                    </div>
                    <motion.button
                      className="icon-btn btn btn-outline-danger"
                      onClick={clearQuickTitles}
                      disabled={!quickTitles.length}
                      title="Clear all quick titles"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="bi bi-trash"></i>
                    </motion.button>
                  </div>

                  {quickTitles.length === 0 ? (
                    <motion.div
                      className="text-center py-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <div className="mb-4">
                        <i className="bi bi-journal-plus display-1 text-muted"></i>
                      </div>
                      <h5 className="text-muted mb-3">No saved titles yet</h5>
                      <p className="text-muted mb-4">
                        Save titles while creating entries to build your quick access list
                      </p>
                      <motion.button
                        className="btn btn-outline-primary"
                        onClick={() => {
                          setCreating(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Entry
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="d-flex flex-column gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      {quickTitles.map((t, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 + idx * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border quick-title-item">
                            <motion.button
                              className="btn text-start flex-grow-1 p-0 border-0 bg-transparent text-dark fw-medium"
                              onClick={() => handleCreateFromQuick(t)}
                              title="Create a new entry with this title"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <i className="bi bi-plus-circle text-primary me-2"></i>
                              {t}
                            </motion.button>

                            <motion.button
                              className="icon-btn btn btn-outline-danger ms-2"
                              title="Remove from quick titles"
                              onClick={() => removeQuickTitle(t)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className="bi bi-x"></i>
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  <hr className="my-4" />

                  <motion.div
                    className="mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-info-circle text-info me-2 fs-5"></i>
                      <h6 className="mb-0 fw-bold text-primary">How to Use</h6>
                    </div>
                    <div className="text-muted small">
                      <p className="mb-2">
                        <i className="bi bi-plus-circle text-primary me-2"></i>
                        Click any title to start a new entry
                      </p>
                      <p className="mb-2">
                        <i className="bi bi-star text-warning me-2"></i>
                        Save titles from the create form
                      </p>
                      <p className="mb-0">
                        <i className="bi bi-trash text-danger me-2"></i>
                        Remove titles you no longer need
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
