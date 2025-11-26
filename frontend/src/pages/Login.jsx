// src/pages/Login.jsx
// Login (Bootstrap) with previous-entry suggestions + example chips
// Matches the Signup UX (stores email history in localStorage under "auth_email_history")

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function InputWithHistory({
  id,
  value,
  onChange,
  placeholder,
  storageKey,
  examples = [],
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
      return [normalized, ...without].slice(0, 10);
    });
  }

  function removeItem(item) {
    setHistory(prev => prev.filter(x => x !== item));
  }

  return (
    <div className="position-relative w-100">
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

      {/* history dropdown */}
      {open && history.length > 0 && (
        <div
          className="position-absolute bg-white border rounded shadow-sm mt-1 w-100"
          style={{ zIndex: 1050, maxHeight: 200, overflow: 'auto' }}
        >
          {history.map((h, idx) => (
            <div
              key={idx}
              className="d-flex align-items-center justify-content-between px-2 py-2"
              style={{ cursor: 'pointer' }}
            >
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
            <div>
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
            </div>

            <div>
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
        </div>
      )}

      {/* examples chips */}
      {examples && examples.length > 0 && (
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
      )}
    </div>
  );
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef(null);

  useEffect(() => {
    // focus the email input on mount
    emailRef.current?.focus();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await API.post('/auth/login', { email, password });

      localStorage.setItem('mydiary_token', data.token);
      localStorage.setItem('mydiary_user', JSON.stringify(data.user));

      // store email into history for future quick-fill
      try {
        const key = 'auth_email_history';
        const arr = JSON.parse(localStorage.getItem(key)) || [];
        const next = [email.trim(), ...arr.filter(x => x !== email.trim())].slice(0, 10);
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {}

      onLogin({ token: data.token, user: data.user });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container hero py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Welcome back</h3>

            <form onSubmit={submit} noValidate>
              <div className="mb-3">
                <label htmlFor="login-email" className="form-label">Email</label>
                <div ref={emailRef}>
                  <InputWithHistory
                    id="login-email"
                    value={email}
                    onChange={(v) => { setEmail(v); setError(''); }}
                    placeholder="you@example.com"
                    storageKey="auth_email_history"
                    examples={['demo@mydiary.com', 'me@personal.com']}
                    invalid={false}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="login-password" className="form-label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <button
                className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : 'Login'}
              </button>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                No account? <Link to="/signup">Create one</Link>
              </small>
            </div>

            <div className="mt-3 text-muted small">
              Tip: click an example to fill your email, or use the dropdown to choose from previous entries.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
