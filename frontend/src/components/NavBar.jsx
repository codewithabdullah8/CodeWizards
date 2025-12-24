// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isDarkMode, toggleTheme } = useTheme();
  const token = localStorage.getItem("mydiary_token");
const user = JSON.parse(localStorage.getItem("mydiary_user") || "null");
const loggedIn = !!token;


  // useEffect(() => {
  //   const token = localStorage.getItem("mydiary_token");
  //   const userData = localStorage.getItem("mydiary_user");
  //   setLoggedIn(!!token);
  //   if (userData) {
  //     setUser(JSON.parse(userData));
  //   }
  // }, []);

  const handleLogout = () => {
  localStorage.removeItem("mydiary_token");
  localStorage.removeItem("mydiary_user");
  navigate("/login", { replace: true });
  window.location.reload(); // Ensure state is reset
};

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/professional", icon: "bi-briefcase", label: "Professional", color: "text-primary" },
    { path: "/personal", icon: "bi-person", label: "Personal", color: "text-success" },
    { path: "/schedule", icon: "bi-calendar-event", label: "Schedule", color: "text-info" }
  ];

  return (
    <motion.nav
      className={`navbar navbar-expand-lg sticky-top ${
        isDarkMode
          ? 'navbar-dark'
          : 'navbar-light'
      }`}
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${isDarkMode ? '#444' : '#e9ecef'}`,
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container-fluid px-4">
        {/* Brand */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            className="navbar-brand d-flex align-items-center fw-bold text-decoration-none"
            to={loggedIn ? "/" : "/login"}
            style={{
              fontSize: '1.25rem',
              letterSpacing: '0.5px'
            }}
          >
            <motion.div
              className="d-flex align-items-center justify-content-center rounded-3 me-3"
              style={{
                width: '40px',
                height: '40px',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)'
                  : 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
                boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)'
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <i className="bi bi-journal-bookmark text-white" style={{ fontSize: '1.1rem' }}></i>
            </motion.div>
            <span style={{
              color: isDarkMode ? '#ffffff' : '#2d2d2d',
              fontWeight: 'bold'
            }}>
              MyDiary
            </span>
          </Link>
        </motion.div>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            background: 'transparent'
          }}
        >
          <motion.span
            className="navbar-toggler-icon"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {loggedIn && navItems.map((item, index) => (
              <motion.li
                key={item.path}
                className="nav-item mx-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <Link
                  className={`nav-link d-flex align-items-center px-3 py-2 rounded-3 position-relative ${
                    isActive(item.path) ? "active" : ""
                  }`}
                  to={item.path}
                  style={{
                    transition: 'all 0.3s ease',
                    fontWeight: '500'
                  }}
                >
                  <motion.i
                    className={`bi ${item.icon} me-2 ${item.color}`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  />
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <motion.div
                      className="position-absolute bottom-0 start-50 translate-middle-x"
                      style={{
                        width: '60%',
                        height: '3px',
                        background: 'linear-gradient(90deg, #0d6efd 0%, #6610f2 100%)',
                        borderRadius: '2px'
                      }}
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Right Side Actions */}
          <ul className="navbar-nav d-flex align-items-center">
            {loggedIn ? (
              <>
                {/* User Info */}
                {user && (
                  <motion.li
                    className="nav-item me-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle me-2"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="d-none d-md-block">
                        <small className="text-muted d-block" style={{ lineHeight: '1.2' }}>
                          Welcome back
                        </small>
                        <small className="fw-semibold" style={{ lineHeight: '1.2' }}>
                          {user.name || 'User'}
                        </small>
                      </div>
                    </div>
                  </motion.li>
                )}

                {/* Theme Toggle */}
                <motion.li
                  className="nav-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    className={`btn rounded-circle p-2 ${
                      isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'
                    }`}
                    onClick={toggleTheme}
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    whileHover={{
                      scale: 1.1,
                      rotate: isDarkMode ? 180 : -180
                    }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      background: isDarkMode
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <i className={`bi ${isDarkMode ? 'bi-sun' : 'bi-moon'}`} style={{ fontSize: '1.1rem' }}></i>
                  </motion.button>
                </motion.li>

                {/* Logout */}
                <motion.li
                  className="nav-item ms-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    className="btn btn-outline-danger d-flex align-items-center px-3 py-2 rounded-3"
                    onClick={handleLogout}
                    data-bs-toggle="tooltip"
                    data-bs-placement="bottom"
                    title="Logout"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    <span className="d-none d-lg-inline">Logout</span>
                  </motion.button>
                </motion.li>
              </>
            ) : (
              <>
                <motion.li
                  className="nav-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    className="nav-link px-3 py-2"
                    to="/login"
                    style={{ fontWeight: '500' }}
                  >
                    Login
                  </Link>
                </motion.li>
                <motion.li
                  className="nav-item ms-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      className="btn btn-primary d-flex align-items-center px-4 py-2 rounded-3 text-decoration-none"
                      to="/signup"
                      style={{
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)'
                      }}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Sign Up
                    </Link>
                  </motion.div>
                </motion.li>
              </>
            )}
          </ul>
        </div>
      </div>
    </motion.nav>
  );
}
