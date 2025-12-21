// src/pages/Signup.jsx
// Enhanced Signup with creative UI/UX design

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
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
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="floating-shapes">
          <motion.div
            className="shape shape-1"
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="shape shape-2"
            animate={{
              y: [0, 35, 0],
              x: [0, 20, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
          <motion.div
            className="shape shape-3"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </div>
      </div>

      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-4">
        <div className="row w-100 justify-content-center">
          {/* Left Side - Welcome Content */}
          <motion.div
            className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="welcome-content text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="welcome-icon mb-4">
                  <i className="bi bi-stars display-1 text-warning"></i>
                </div>
              </motion.div>

              <motion.h1
                className="display-4 fw-bold mb-3 gradient-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Start Your Journey
              </motion.h1>

              <motion.p
                className="lead mb-4 text-muted"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                Begin capturing your thoughts, memories, and dreams.
                Your personal diary awaits to be filled with your unique story.
              </motion.p>

              <motion.div
                className="journey-steps"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="steps-container">
                  <div className="step-item">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h6>Create Account</h6>
                      <small>Quick and secure signup</small>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h6>Write Your First Entry</h6>
                      <small>Express your thoughts</small>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h6>Build Your Story</h6>
                      <small>Reflect and grow</small>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Signup Form */}
          <motion.div
            className="col-12 col-lg-6 d-flex align-items-center justify-content-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="auth-card">
              <motion.div
                className="card-header text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="auth-icon mb-3">
                  <i className="bi bi-person-plus-fill display-6 text-success"></i>
                </div>
                <h2 className="h4 mb-1">Join MyDiary</h2>
                <p className="text-muted small">Create your personal space</p>
              </motion.div>

              <motion.div
                className="card-body"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <form onSubmit={submit} noValidate>
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-semibold">
                      <i className="bi bi-person me-2 text-success"></i>
                      Full Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-fill"></i>
                      </span>
                      <InputWithHistory
                        id="name"
                        value={name}
                        onChange={(v) => { setName(v); setFieldErrors(f => ({ ...f, name: '' })); }}
                        placeholder="Enter your full name"
                        storageKey="auth_name_history"
                        examples={['Alex Johnson', 'Priya Patel', 'Sam Wilson']}
                        invalid={!!fieldErrors.name}
                        onSaveRequest={() => {}}
                      />
                    </div>
                    {fieldErrors.name && <div className="invalid-feedback d-block">{fieldErrors.name}</div>}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2 text-success"></i>
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-at"></i>
                      </span>
                      <InputWithHistory
                        id="email"
                        value={email}
                        onChange={(v) => { setEmail(v); setFieldErrors(f => ({ ...f, email: '' })); }}
                        placeholder="Enter your email"
                        storageKey="auth_email_history"
                        examples={['demo@mydiary.com', 'me@personal.com']}
                        invalid={!!fieldErrors.email}
                      />
                    </div>
                    {fieldErrors.email && <div className="invalid-feedback d-block">{fieldErrors.email}</div>}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="bi bi-lock me-2 text-success"></i>
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        id="password"
                        type="password"
                        className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: '' })); }}
                        placeholder="Create a strong password"
                      />
                    </div>
                    {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
                  </div>

                  {error && (
                    <motion.div
                      className="alert alert-danger d-flex align-items-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    className="btn btn-success w-100 d-flex justify-content-center align-items-center py-3 fw-semibold"
                    disabled={loading}
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-rocket-takeoff me-2"></i>
                        Start My Journey
                      </>
                    )}
                  </motion.button>
                </form>

                <motion.div
                  className="text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-muted mb-2">Already have an account?</p>
                  <Link
                    to="/login"
                    className="btn btn-outline-success d-inline-flex align-items-center"
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In Instead
                  </Link>
                </motion.div>

                <motion.div
                  className="text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    Your data is secure and private
                  </small>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
