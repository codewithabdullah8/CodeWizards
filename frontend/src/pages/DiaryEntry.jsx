// src/pages/DiaryEntry.jsx
// DiaryEntry with previous-entry history + example chips (Bootstrap style)
// Keeps your original audio/autoplay logic, but adds local history UX

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const MP3_FIRST = {
  calm: ['/music/calm.mp3', '/music/calm.wav'],
  focus: ['/music/focus.mp3', '/music/focus.wav'],
  rain: ['/music/rain.mp3', '/music/rain.wav'],
  none: [null],
};

function InputWithHistory({
  id,
  value,
  onChange,
  placeholder,
  storageKey,
  examples = [],
  rows = 1,
  invalid = false,
}) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const blurTimeout = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setHistory([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (e) {}
  }, [history, storageKey]);

  function saveCurrent(v) {
    if (!v || !v.trim()) return;
    const normalized = v.trim();
    setHistory(prev => {
      const without = prev.filter(x => x !== normalized);
      return [normalized, ...without].slice(0, 20);
    });
  }

  function removeItem(item) {
    setHistory(prev => prev.filter(x => x !== item));
  }

  return (
    <div className="position-relative w-100">
      {rows === 1 ? (
        <input
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => {
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
            setOpen(true);
          }}
          onBlur={() => {
            blurTimeout.current = setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          className={`form-control ${invalid ? 'is-invalid' : ''}`}
          autoComplete="off"
        />
      ) : (
        <textarea
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => {
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
            setOpen(true);
          }}
          onBlur={() => {
            blurTimeout.current = setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          rows={rows}
          className={`form-control ${invalid ? 'is-invalid' : ''}`}
        />
      )}

      {/* history dropdown (for single-line inputs) */}
      {open && history.length > 0 && rows === 1 && (
        <div
          className="position-absolute bg-white border rounded shadow-sm mt-1 w-100"
          style={{ zIndex: 1050, maxHeight: 220, overflow: 'auto' }}
        >
          {history.map((h, idx) => (
            <div key={idx} className="d-flex align-items-center justify-content-between px-2 py-2" style={{ cursor: 'pointer' }}>
              <button
                type="button"
                className="btn btn-link text-start p-0 flex-grow-1 text-truncate"
                onClick={() => {
                  onChange(h);
                  setOpen(false);
                }}
              >
                {h}
              </button>

              <button
                type="button"
                title="Remove"
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(h);
                }}
              >
                &times;
              </button>
            </div>
          ))}

          <div className="px-2 py-2 border-top d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                localStorage.removeItem(storageKey);
                setHistory([]);
                setOpen(false);
              }}
            >
              Clear history
            </button>

            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => {
                saveCurrent(value);
                setOpen(false);
              }}
            >
              Save current
            </button>
          </div>
        </div>
      )}

      {/* examples chips (below input/textarea, NOT on side) */}
      <div className="mt-2 d-flex flex-wrap gap-2">
        {examples.map((ex, i) => (
          <button
            key={i}
            type="button"
            className="btn btn-sm btn-outline-secondary me-2 mb-2"
            onClick={() => onChange(ex)}
          >
            {ex}
          </button>
        ))}

        <button
          type="button"
          className="btn btn-sm btn-primary mb-2"
          onClick={() => saveCurrent(value)}
          title="Save current value to history"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function DiaryEntry() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const [autoPlayFailed, setAutoPlayFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/diary/' + id)
      .then(({ data }) => {
        setEntry(data);
        setDraftTitle(data.title || '');
        setDraftContent(data.content || '');
      })
      .catch(() => setError('Not found'));
  }, [id]);

  useEffect(() => {
    if (!entry) return;

    const candidates = MP3_FIRST[entry.musicKey || 'none'];
    const audio = audioRef.current;

    if (!candidates || !audio || !candidates[0]) return;

    async function tryPlay(urls) {
      for (const src of urls) {
        try {
          audio.src = src;
          audio.loop = true;
          await audio.play();
          return;
        } catch (e) {}
      }
      setAutoPlayFailed(true);
    }

    tryPlay(candidates);
  }, [entry]);

  if (error) {
    return (
      <div className="container hero">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container hero">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { title: draftTitle, content: draftContent };
      await API.put('/diary/' + id, payload);
      setEntry(prev => ({ ...prev, ...payload }));
      // save title/content snippets to local history for reuse
      try {
        const tKey = 'diary_title_history';
        const tArr = JSON.parse(localStorage.getItem(tKey)) || [];
        localStorage.setItem(tKey, JSON.stringify([draftTitle.trim(), ...tArr.filter(x => x !== draftTitle.trim())].slice(0, 20)));
      } catch (e) {}
      try {
        const cKey = 'diary_content_snippets';
        const cArr = JSON.parse(localStorage.getItem(cKey)) || [];
        const snippet = draftContent.trim().slice(0, 200); // store short snippet
        if (snippet) {
          localStorage.setItem(cKey, JSON.stringify([snippet, ...cArr.filter(x => x !== snippet)].slice(0, 20)));
        }
      } catch (e) {}
      setEditing(false);
    } catch (e) {
      alert('Save failed — please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this entry? This action cannot be undone.')) return;
    try {
      await API.delete('/diary/' + id);
      navigate('/');
    } catch (e) {
      alert('Delete failed.');
    }
  }

  return (
    <div className="container hero py-4">
      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div style={{ flex: 1 }}>
            {editing ? (
              <InputWithHistory
                id="diary-title"
                value={draftTitle}
                onChange={setDraftTitle}
                placeholder="Title"
                storageKey="diary_title_history"
                examples={[entry.title, 'Morning reflection', 'Gratitude note']}
              />
            ) : (
              <h3 className="mb-0">{entry.title}</h3>
            )}

            <small className="text-muted d-block mt-1">{new Date(entry.createdAt).toLocaleString()}</small>
          </div>

          <div className="d-flex gap-2 ms-3">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>Back</button>

            <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(e => !e)}>
              {editing ? 'Cancel' : 'Edit'}
            </button>

            {editing ? (
              <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            ) : (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => navigator.clipboard?.writeText(entry.content)}
                title="Copy content"
              >
                Copy
              </button>
            )}

            <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="mt-3">
          {editing ? (
            <>
              <label className="form-label">Content</label>

              <InputWithHistory
                id="diary-content"
                value={draftContent}
                onChange={setDraftContent}
                placeholder="Write your entry here..."
                storageKey="diary_content_snippets"
                examples={['Today I felt grateful for...', 'Short note: ...']}
                rows={8}
              />

              <div className="mt-2 d-flex justify-content-between align-items-center">
                <small className="text-muted">Tip: Save to keep this entry and add to quick snippets.</small>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDraftContent('')}>Clear</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDraftContent(prev => prev + '\n\n— Edited')}>Append</button>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-3" style={{ whiteSpace: 'pre-wrap' }}>{entry.content}</p>
          )}
        </div>

        {entry.musicKey !== 'none' && (
          <div className="mt-3">
            <audio ref={audioRef} controls style={{ width: '100%' }} />
            {autoPlayFailed && (
              <div className="alert alert-info mt-2 py-2">
                Autoplay was blocked or the file type isn't supported. <br />
                Click play or replace with an MP3 in <code>/public/music</code>.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
