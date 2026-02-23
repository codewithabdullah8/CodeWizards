// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import auth from "../api/auth";
import "./AuthPages.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
    const savedEmail = localStorage.getItem("mydiary_email");
    const wasRemembered = localStorage.getItem("mydiary_remember");
    if (savedEmail && wasRemembered === "true") {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return;

    setLoading(true);

    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((user) => {
        localStorage.setItem("mydiary_token", token);
        localStorage.setItem("mydiary_user", JSON.stringify(user));

        if (onLogin) {
          onLogin({ token, user });
        } else {
          navigate("/", { replace: true });
        }
      })
      .catch((err) => {
        console.error("OAuth error:", err);
        setError("OAuth signin failed. Please try again.");
        setLoading(false);
      });
  }, [onLogin, navigate]);

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

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await auth.login({ email, password });

      if (rememberMe) {
        localStorage.setItem("mydiary_email", email);
        localStorage.setItem("mydiary_remember", "true");
      } else {
        localStorage.removeItem("mydiary_email");
        localStorage.removeItem("mydiary_remember");
      }

      if (onLogin) {
        onLogin({ token: data.token, user: data.user });
      } else {
        localStorage.setItem("mydiary_token", data.token);
        localStorage.setItem("mydiary_user", JSON.stringify(data.user));
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Login failed";
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes("email")) {
        setEmailError("Email not found or invalid");
      } else if (errorMessage.toLowerCase().includes("password")) {
        setPasswordError("Incorrect password");
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
            Sign in to capture your moments, sync across devices, and keep your
            thoughts safe in one place.
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
            <h2>Sign In to Your Account</h2>
            <p>Welcome back. Please enter your details.</p>
          </div>

          <motion.button
            type="button"
            className="auth-google-btn"
            onClick={() => {
              window.location.href = "http://localhost:5000/api/auth/google";
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4" />
              <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" fill="#34A853" />
              <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" fill="#FBBC05" />
              <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" fill="#EA4335" />
            </svg>
            Continue with Google
          </motion.button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <form onSubmit={submit} className="auth-form">
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
                  ref={emailRef}
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
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">Password</label>
                <button
                  type="button"
                  className="form-forgot-link"
                  onClick={() => alert("Password recovery feature coming soon!")}
                  tabIndex="-1"
                >
                  Forgot?
                </button>
              </div>
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
            </div>

            <div className="form-checkbox-group">
              <input
                id="remember"
                type="checkbox"
                className="form-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="remember" className="form-checkbox-label">
                Remember me on this device
              </label>
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <div className="auth-footer">
            <span>Don&apos;t have an account?</span>
            <Link to="/signup" className="auth-link-button">Create Account</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
