// src/pages/Login.jsx
// Enhanced Login with creative UI/UX design

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
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="floating-shapes">
          <motion.div
            className="shape shape-1"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="shape shape-2"
            animate={{
              y: [0, 30, 0],
              x: [0, -15, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="shape shape-3"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
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
                  <i className="bi bi-journal-bookmark-fill display-1 text-primary"></i>
                </div>
              </motion.div>

              <motion.h1
                className="display-4 fw-bold mb-3 gradient-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Welcome Back
              </motion.h1>

              <motion.p
                className="lead mb-4 text-muted"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                Continue your journey of self-discovery and reflection.
                Your thoughts, memories, and dreams await.
              </motion.p>

              <motion.div
                className="features-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="row g-3">
                  <div className="col-6">
                    <div className="feature-item">
                      <i className="bi bi-shield-check text-success me-2"></i>
                      Secure & Private
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="feature-item">
                      <i className="bi bi-lightning text-warning me-2"></i>
                      Lightning Fast
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="feature-item">
                      <i className="bi bi-cloud text-info me-2"></i>
                      Cloud Sync
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="feature-item">
                      <i className="bi bi-heart text-danger me-2"></i>
                      Made with Love
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
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
                  <i className="bi bi-box-arrow-in-right display-6 text-primary"></i>
                </div>
                <h2 className="h4 mb-1">Sign In to Your Account</h2>
                <p className="text-muted small">Access your personal diary</p>
              </motion.div>

              <motion.div
                className="card-body"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <form onSubmit={submit} noValidate>
                  <div className="mb-4">
                    <label htmlFor="login-email" className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      Email Address
                    </label>
                    <div ref={emailRef} className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-at"></i>
                      </span>
                      <InputWithHistory
                        id="login-email"
                        value={email}
                        onChange={(v) => { setEmail(v); setError(''); }}
                        placeholder="Enter your email"
                        storageKey="auth_email_history"
                        examples={['demo@mydiary.com', 'me@personal.com']}
                        invalid={false}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="login-password" className="form-label fw-semibold">
                      <i className="bi bi-lock me-2 text-primary"></i>
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        id="login-password"
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
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
                    className="btn btn-primary w-100 d-flex justify-content-center align-items-center py-3 fw-semibold"
                    disabled={loading}
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing you in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
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
                  <p className="text-muted mb-2">Don't have an account?</p>
                  <Link
                    to="/signup"
                    className="btn btn-outline-primary d-inline-flex align-items-center"
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Create Account
                  </Link>
                </motion.div>

                <motion.div
                  className="text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <small className="text-muted">
                    <i className="bi bi-lightbulb me-1"></i>
                    Pro tip: Use the dropdown to select from previous emails
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
