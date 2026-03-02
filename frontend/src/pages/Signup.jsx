// src/pages/Signup.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import auth from "../api/auth";
import "./AuthPages.css";

export default function Signup({ onSignup }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validateName = (nameValue) => {
    if (!nameValue) {
      setNameError("Full name is required");
      return false;
    }
    if (nameValue.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      setPasswordError("Password is required");
      return false;
    }
    if (passwordValue.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await auth.signup({ name, email, password });

      if (onSignup) {
        onSignup({ token: data.token, user: data.user });
      } else {
        localStorage.setItem("mydiary_token", data.token);
        localStorage.setItem("mydiary_user", JSON.stringify(data.user));
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Signup failed";
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes("email")) {
        setEmailError("This email is already registered");
      } else if (errorMessage.toLowerCase().includes("name")) {
        setNameError("Invalid name");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-left">
        <div className="auth-left-content">
          <div className="auth-badge">MyDiary</div>
          <h1 className="auth-left-title">Welcome Back</h1>
          <p className="auth-left-text">
            Create your account and keep every thought organized, private, and
            beautifully synced across devices.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-dot" />
              <span>Secure & Private</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-dot" />
              <span>Lightning Fast</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-dot" />
              <span>Cloud Sync</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-dot" />
              <span>Made with Love</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-card-header">
            <h2>Create Your Account</h2>
            <p>Start your diary journey today.</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <motion.div
                className={`input-icon ${nameError ? "input-icon-error" : ""}`}
                initial={false}
                animate={{ scale: nameError ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="name"
                  ref={nameRef}
                  type="text"
                  className={`form-input ${nameError ? "form-input-error" : ""}`}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  onBlur={() => {
                    if (name.trim()) validateName(name);
                  }}
                  disabled={loading}
                  required
                />
              </motion.div>
              <AnimatePresence mode="wait">
                {nameError && (
                  <motion.p
                    className="form-error-text"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <motion.div
                className={`input-icon ${emailError ? "input-icon-error" : ""}`}
                initial={false}
                animate={{ scale: emailError ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                  <path d="m22 8-10 6L2 8" />
                </svg>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${emailError ? "form-input-error" : ""}`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onBlur={() => {
                    if (email.trim()) validateEmail(email);
                  }}
                  disabled={loading}
                  required
                />
              </motion.div>
              <AnimatePresence mode="wait">
                {emailError && (
                  <motion.p
                    className="form-error-text"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <motion.div
                className={`input-icon input-icon-password ${passwordError ? "input-icon-error" : ""}`}
                initial={false}
                animate={{ scale: passwordError ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${passwordError ? "form-input-error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  onBlur={() => {
                    if (password) validatePassword(password);
                  }}
                  disabled={loading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="form-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </motion.div>
              <AnimatePresence mode="wait">
                {passwordError && (
                  <motion.p
                    className="form-error-text"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
              <small className="form-hint">Must be at least 6 characters</small>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">!</text>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              className="submit-btn"
              type="submit"
              disabled={loading}
              whileHover={{ scale: !loading ? 1.02 : 1 }}
              whileTap={{ scale: !loading ? 0.98 : 1 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="submit-btn-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link-button">Sign In</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
