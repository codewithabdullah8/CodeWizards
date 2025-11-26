// src/pages/Signup.jsx
// Updated Signup with previous-entry history + examples (Bootstrap)
// Reference screenshot (user provided): /mnt/data/c014169f-51cc-4364-8fa0-27491a1bbf94.png

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
  onSaveRequest, // optional callback to save current value externally
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
    onSaveRequest?.(v);
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
          // slight delay to allow click on dropdown items
          blurTimeout.current = setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        className={`form-control ${invalid ? 'is-invalid' : ''}`}
        aria-autocomplete="list"
        aria-haspopup="true"
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
              className="d-flex align-items-center justify-content-between px-2 py-2 hover-bg"
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

          <div className="px-2 py-2 border-top">
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
              className="btn btn-sm btn-link ms-2"
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

export default function Signup({ onSignup }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // optional: keep focus / UX improvements
  const nameRef = useRef(null);

  useEffect(() => {
    // focus first input for convenience
    nameRef.current?.focus();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // client-side validation
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/auth/signup', { name, email, password });

      // Save token & user
      localStorage.setItem('mydiary_token', data.token);
      localStorage.setItem('mydiary_user', JSON.stringify(data.user));

      // push name/email into histories (separate keys)
      try {
        const k1 = 'auth_name_history';
        const a1 = JSON.parse(localStorage.getItem(k1)) || [];
        const next1 = [name.trim(), ...a1.filter(x => x !== name.trim())].slice(0, 10);
        localStorage.setItem(k1, JSON.stringify(next1));
      } catch (e) {}

      try {
        const k2 = 'auth_email_history';
        const a2 = JSON.parse(localStorage.getItem(k2)) || [];
        const next2 = [email.trim(), ...a2.filter(x => x !== email.trim())].slice(0, 10);
        localStorage.setItem(k2, JSON.stringify(next2));
      } catch (e) {}

      onSignup({ token: data.token, user: data.user });
    } catch (err) {
      console.error('Signup error', err);
      setError(err?.response?.data?.message || err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container hero py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Create your account</h3>

            <form onSubmit={submit} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <InputWithHistory
                  id="name"
                  value={name}
                  onChange={(v) => { setName(v); setFieldErrors(f => ({ ...f, name: '' })); }}
                  placeholder="Your name"
                  storageKey="auth_name_history"
                  examples={['Alex', 'Priya', 'Sam']}
                  invalid={!!fieldErrors.name}
                  onSaveRequest={() => {}}
                />
                {fieldErrors.name && <div className="invalid-feedback d-block">{fieldErrors.name}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <InputWithHistory
                  id="email"
                  value={email}
                  onChange={(v) => { setEmail(v); setFieldErrors(f => ({ ...f, email: '' })); }}
                  placeholder="you@example.com"
                  storageKey="auth_email_history"
                  examples={['demo@mydiary.com', 'me@personal.com']}
                  invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <div className="invalid-feedback d-block">{fieldErrors.email}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: '' })); }}
                  placeholder="Choose a password"
                />
                {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
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
                    Signing up...
                  </>
                ) : 'Signup'}
              </button>
            </form>

            <div className="text-center mt-3">
              <small className="text-muted">
                Already have an account? <Link to="/login">Login</Link>
              </small>
            </div>

            <div className="mt-3 text-muted small">
              Tip: click an example to fill a field, or use the dropdown to choose from previous entries.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
