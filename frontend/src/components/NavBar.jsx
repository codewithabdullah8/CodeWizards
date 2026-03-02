import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSaveSettings = () => {
    setSettingsOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (settingsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [settingsOpen]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: "bi-house" },
    { path: "/recent", label: "Recent Entries", icon: "bi-clock-history" },
    { path: "/professional", label: "Professional", icon: "bi-briefcase" },
    { path: "/personal", label: "Personal", icon: "bi-journal-text" },
    { path: "/mood-checkin", label: "Mood Check‑in", icon: "bi-emoji-smile" }
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
              <button
                className="dropdown-item"
                onClick={() => {
                  setSettingsOpen(true);
                  setUserMenuOpen(false);
                }}
              >
                <i className="bi bi-gear"></i>
                Settings
              </button>
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
          {/* Navigation Items */}
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

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            className="modal-overlay"
            onClick={() => setSettingsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="settings-modal-header">
                <h3 className="settings-modal-title">Settings</h3>
                <button
                  className="settings-close-btn"
                  aria-label="Close settings"
                  onClick={() => setSettingsOpen(false)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>

              <div className="settings-modal-section">
                <div className="settings-row">
                  <span>Theme</span>
                  <ThemeToggle size="small" />
                </div>
              </div>

              <div className="settings-modal-section">
                <h4 className="settings-section-title">Preferences</h4>
                <p className="settings-placeholder">Preference options coming soon.</p>
              </div>

              <div className="settings-modal-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSaveSettings}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
