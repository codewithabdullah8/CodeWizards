// src/pages/Dashboard.jsx
// Dashboard with inline "Create new entry" form + recent entries + quick titles

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';

export default function Dashboard() {
  const [recentEntries, setRecentEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState('');
  const [quickTitles, setQuickTitles] = useState([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
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
          </div>
        </div>

        {/* Inline create form */}
        {creating && (
          <div className="col-12">
            <div className="card p-3 mb-3">
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
            </div>
          </div>
        )}

        {/* Recent entries (main column) */}
        <div className="col-lg-8">
          <div className="card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="mb-0">Recent entries</h5>
              <div style={{ minWidth: 220 }}>
                <input
                  className="form-control form-control-sm"
                  placeholder="Search recent..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
            </div>

            {loadingEntries ? (
              <div className="text-center py-4 text-muted">Loading...</div>
            ) : error ? (
              <div className="alert alert-warning py-2">{error}</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-muted py-3">No recent entries found.</div>
            ) : (
              <div className="list-group">
                {filteredEntries.map((it) => (
                  <button
                    key={it._id || it.id || it.createdAt}
                    type="button"
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                    onClick={() => navigate(`/entry/${it._id || it.id}`)}
                  >
                    <div className="ms-2 me-auto text-start">
                      <div className="fw-bold">{it.title || '(untitled)'}</div>
                      <div className="text-truncate" style={{ maxWidth: '60ch' }}>{(it.content || '').slice(0, 160)}</div>
                    </div>
                    <small className="text-muted">{new Date(it.createdAt).toLocaleDateString()}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick titles (side column) */}
        <div className="col-lg-4">
          <div className="card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="mb-0">Quick titles</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-danger" onClick={clearQuickTitles} disabled={!quickTitles.length}>
                  Clear
                </button>
              </div>
            </div>

            {quickTitles.length === 0 ? (
              <div className="text-muted">No saved titles yet. Save while creating an entry to add quick titles.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {quickTitles.map((t, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-secondary text-start flex-grow-1 text-truncate"
                      onClick={() => handleCreateFromQuick(t)}
                      title="Create a new entry with this title"
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                    >
                      {t}
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      title="Remove from quick titles"
                      onClick={() => removeQuickTitle(t)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <hr />

            <div className="mt-2">
              <h6 className="small text-muted">Tips</h6>
              <ul className="small mb-0">
                <li>Click a quick title to create a new entry prefilled with that title.</li>
                <li>Saved titles come from your recent diary saves (stored locally).</li>
                <li>You can manage quick titles from the Diary page as well.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
