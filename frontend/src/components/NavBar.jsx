import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const navItems = [
    { path: "/personal", label: "Personal", icon: "bi-journal-text" },
    { path: "/recent", label: "Recent Entries", icon: "bi-clock-history" },
    { path: "/professional", label: "Professional", icon: "bi-briefcase" },
    { path: "/schedule", label: "Schedule", icon: "bi-calendar" }
  ];

  return (
    <motion.nav
      className="main-navbar"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* LEFT - Menu Button & Logo */}
      <div className="navbar-left">
        <button
          className="menu-btn"
          onClick={() => setNavMenuOpen(!navMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <i className="bi bi-list"></i>
        </button>

        <Link to="/" className="navbar-brand">
          <h1 className="navbar-logo">DayTrack</h1>
        </Link>
      </div>

      {/* CENTER - Empty for now, could add search or other elements later */}
      <div className="navbar-center">
        {/* Future: search bar or other center elements */}
      </div>

      {/* RIGHT - User Menu */}
      <div className="navbar-user">
        <div className="user-menu-container">
          <button
            className="user-menu-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.name || "User"}</div>
                  <div className="user-email">{user?.email || ""}</div>
                </div>
              </div>
              <hr className="dropdown-divider" />
              <div className="dropdown-item theme-toggle-item">
                <ThemeToggle size="small" />
                <span>Theme</span>
              </div>
              <hr className="dropdown-divider" />
              <button
                className="dropdown-item logout"
                onClick={onLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu Overlay */}
      {navMenuOpen && (
        <div
          className="nav-menu-overlay"
          onClick={() => setNavMenuOpen(false)}
        />
      )}

      {/* Navigation Menu Sidebar */}
      <motion.div
        className={`nav-menu-sidebar ${navMenuOpen ? 'open' : ''}`}
        initial={{ x: -280 }}
        animate={{ x: navMenuOpen ? 0 : -280 }}
        transition={{ ease: "easeOut", duration: 0.3 }}
      >
        <div className="nav-menu-header">
          <h3 className="nav-menu-title">Menu</h3>
          <button
            className="nav-menu-close"
            onClick={() => setNavMenuOpen(false)}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="nav-menu-content">
          {/* Dashboard Link */}
          <Link
            to="/"
            className={`nav-menu-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setNavMenuOpen(false)}
          >
            <i className="bi bi-house"></i>
            <span>Dashboard</span>
          </Link>

          {/* Other Navigation Items */}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setNavMenuOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Overlay for user menu */}
      {userMenuOpen && (
        <div
          className="navbar-overlay"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </motion.nav>
  );
}
