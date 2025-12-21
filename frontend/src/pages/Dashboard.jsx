// src/pages/Dashboard.jsx
// Dashboard with inline "Create new entry" form + recent entries + quick titles

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      className="container py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="row g-4">
        <div className="col-12">
          <motion.div 
            className="d-flex justify-content-between align-items-center mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-0">Dashboard</h2>
            <div>
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => {
                  // toggle inline create form
                  setCreating(c => !c);
                  if (!creating) window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {creating ? 'Close' : '+ New Entry'}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
                Refresh
              </button>
            </div>
          </motion.div>
        </div>

        {/* Inline create form */}
        {creating && (
          <div className="col-12">
            <motion.div 
              className="card p-3 mb-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h5 className="mb-2">Create new entry</h5>

              <form onSubmit={handleCreateSubmit}>
                <div className="mb-3">
                  <label htmlFor="create-title" className="form-label">Title</label>
                  <input
                    id="create-title"
                    className="form-control"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="Entry title"
                    autoComplete="off"
                  />
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {/* small example chips */}
                    {['Morning reflection', 'Gratitude', 'Work notes'].map((ex, i) => (
                      <button
                        type="button"
                        key={i}
                        className="btn btn-sm btn-outline-secondary me-2 mb-2"
                        onClick={() => setCreateTitle(ex)}
                      >
                        {ex}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mb-2"
                      onClick={() => {
                        // save current title to quick titles
                        if (createTitle.trim()) saveQuickTitleLocally(createTitle.trim());
                      }}
                    >
                      Save title
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="create-content" className="form-label">Content</label>
                  <textarea
                    id="create-content"
                    rows={6}
                    className="form-control"
                    value={createContent}
                    onChange={(e) => setCreateContent(e.target.value)}
                    placeholder="Write your entry..."
                  />
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {['Today I felt grateful for...', 'Short note: ...'].map((ex, i) => (
                      <button
                        type="button"
                        key={i}
                        className="btn btn-sm btn-outline-secondary me-2 mb-2"
                        onClick={() => setCreateContent(ex)}
                      >
                        {ex}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary mb-2"
                      onClick={() => setCreateContent('')}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="create-music" className="form-label">Ambient music</label>
                  <select
                    id="create-music"
                    className="form-select"
                    value={createMusic}
                    onChange={(e) => setCreateMusic(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="calm">Calm</option>
                    <option value="focus">Focus</option>
                    <option value="rain">Rain</option>
                  </select>
                </div>

                {createError && (
                  <div className="alert alert-danger">
                    {createError}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button className="btn btn-primary" disabled={creatingSaving} type="submit">
                    {creatingSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : 'Create Entry'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setCreating(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Recent entries (main column) */}
        <div className="col-lg-8">
          <motion.div
            className="card p-3 h-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-journal-text text-primary me-2"></i>
                <h5 className="mb-0 fw-bold">Recent Entries</h5>
                <span className="badge bg-primary ms-2 rounded-pill">{filteredEntries.length}</span>
              </div>
              <div style={{ minWidth: 220 }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    className="form-control border-start-0"
                    placeholder="Search entries..."
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
                className="alert alert-warning d-flex align-items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </motion.div>
            ) : filteredEntries.length === 0 ? (
              <motion.div
                className="text-center py-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
                <h6 className="text-muted mt-3">No entries found</h6>
                <p className="text-muted small">Create your first diary entry to get started!</p>
              </motion.div>
            ) : (
              <div className="row g-3">
                {filteredEntries.map((it, index) => (
                  <motion.div
                    key={it._id || it.id || it.createdAt}
                    className="col-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className="recent-entry-card p-3 rounded-3 border cursor-pointer"
                      onClick={() => navigate(`/entry/${it._id || it.id}`)}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid #e9ecef',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1 me-3">
                          <h6 className="mb-1 fw-semibold text-dark">
                            <i className="bi bi-file-earmark-text text-primary me-2"></i>
                            {it.title || '(untitled)'}
                          </h6>
                          <p className="text-muted small mb-2 line-clamp-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {(it.content || '').slice(0, 200)}
                          </p>
                        </div>
                        <div className="text-end">
                          <small className="text-muted d-block">
                            <i className="bi bi-calendar-event me-1"></i>
                            {new Date(it.createdAt).toLocaleDateString()}
                          </small>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(it.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                          {it.musicKey && (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                              <i className="bi bi-music-note me-1"></i>
                              {it.musicKey}
                            </span>
                          )}
                          <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
                            <i className="bi bi-eye me-1"></i>
                            View
                          </span>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick titles (side column) */}
        <div className="col-lg-4">
          <motion.div
            className="card p-3 h-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-lightning-charge text-warning me-2"></i>
                <h6 className="mb-0 fw-bold">Quick Titles</h6>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={clearQuickTitles}
                  disabled={!quickTitles.length}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Clear all quick titles"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>

            {quickTitles.length === 0 ? (
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <i className="bi bi-journal-plus text-muted" style={{ fontSize: '2rem' }}></i>
                <div className="text-muted mt-2 small">No saved titles yet</div>
                <div className="text-muted small">Save titles while creating entries to add quick access</div>
              </motion.div>
            ) : (
              <motion.div
                className="d-flex flex-column gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {quickTitles.map((t, idx) => (
                  <motion.div
                    key={idx}
                    className="quick-title-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="d-flex align-items-center justify-content-between p-2 rounded-3 border"
                         style={{
                           background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                           border: '1px solid #dee2e6',
                           transition: 'all 0.2s ease'
                         }}>
                      <button
                        className="btn btn-sm text-start flex-grow-1 p-0 border-0 bg-transparent text-dark fw-medium"
                        onClick={() => handleCreateFromQuick(t)}
                        title="Create a new entry with this title"
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.875rem'
                        }}
                      >
                        <i className="bi bi-plus-circle text-primary me-2"></i>
                        {t}
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger ms-2 rounded-circle p-1"
                        title="Remove from quick titles"
                        onClick={() => removeQuickTitle(t)}
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="bi bi-x" style={{ fontSize: '0.75rem' }}></i>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <hr className="my-3" />

            <motion.div
              className="mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-info-circle text-info me-2"></i>
                <h6 className="small text-muted mb-0 fw-semibold">How it works</h6>
              </div>
              <ul className="small mb-0 text-muted">
                <li className="mb-1">Click any title to start a new entry</li>
                <li className="mb-1">Titles are saved from your recent entries</li>
                <li>Manage titles from the Diary page</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
