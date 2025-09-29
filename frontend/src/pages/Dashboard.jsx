import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

const MUSIC_OPTIONS = [
  { key: 'none', label: 'No music' },
  { key: 'calm', label: 'Calm' },
  { key: 'focus', label: 'Focus' },
  { key: 'rain', label: 'Rain' },
];

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [musicKey, setMusicKey] = useState('none');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await API.get('/diary');
    setEntries(data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/diary', { title, content, musicKey });
      setEntries([data, ...entries]);
      setTitle('');
      setContent('');
      setMusicKey('none');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await API.delete('/diary/' + id);
    setEntries(entries.filter((e) => e._id !== id));
  };

  return (
    <div className="container hero">
      <div className="row">
        {/* Left column - New Entry */}
        <div className="col-lg-5">
          <div className="card p-3 mb-3">
            <h5 className="mb-3">New Diary Entry</h5>
            <form onSubmit={create}>
              <div className="mb-2">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Content</label>
                <textarea
                  rows="5"
                  className="form-control"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Music</label>
                <select
                  className="form-select"
                  value={musicKey}
                  onChange={(e) => setMusicKey(e.target.value)}
                >
                  {MUSIC_OPTIONS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Add Entry'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column - Entry list */}
        <div className="col-lg-7">
          <div className="row">
            {entries.map((en) => (
              <div className="col-md-12" key={en._id}>
                <div className="card mb-3 p-3 entry-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{en.title}</h5>
                    <small className="text-muted">
                      {new Date(en.createdAt).toLocaleString()}
                    </small>
                  </div>

                  <p className="mt-2 mb-2">{en.content}</p>

                  <div className="d-flex justify-content-between">
                    <div>
                      <span className="badge bg-light text-dark music-badge">
                        Music: {en.musicKey}
                      </span>
                    </div>
                    <div>
                      <Link
                        className="btn btn-sm btn-outline-primary me-2"
                        to={`/entry/${en._id}`}
                      >
                        Open
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remove(en._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!entries.length && (
              <div className="text-center text-muted">
                No entries yet. Create your first above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
