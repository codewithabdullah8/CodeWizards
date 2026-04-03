import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import SettingsAPI from "../api/settings";
import { useToast } from "../contexts/ToastContext";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { t, i18n } = useTranslation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('emailNotifications') === 'true';
  });
  const [autoSaveDraft, setAutoSaveDraft] = useState(() => {
    return localStorage.getItem('autoSaveDraft') !== 'false'; // Default true
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Update i18n language when language state changes
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await SettingsAPI.getSettings();
        setEmailNotifications(data.emailNotifications);
        setAutoSaveDraft(data.autoSaveDraft);
        setLanguage(data.language);
        
        // Also update localStorage
        localStorage.setItem('emailNotifications', data.emailNotifications);
        localStorage.setItem('autoSaveDraft', data.autoSaveDraft);
        localStorage.setItem('language', data.language);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      // Save to backend
      await SettingsAPI.updateSettings({
        emailNotifications,
        autoSaveDraft,
        language
      });
      
      // Save to localStorage
      localStorage.setItem('emailNotifications', emailNotifications);
      localStorage.setItem('autoSaveDraft', autoSaveDraft);
      localStorage.setItem('language', language);
      
      // Update i18n language
      i18n.changeLanguage(language);
      
      addToast(t('settingsSaved'), 'success');
      setSettingsOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast(t('settingsFailed'), 'error');
    } finally {
      setSettingsLoading(false);
    }
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

  useEffect(() => {
    setUserMenuOpen(false);
    setNavMenuOpen(false);
    setSettingsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: t('dashboard'), icon: "bi-house" },
    { path: "/recent", label: t('recentEntries'), icon: "bi-clock-history" },
    { path: "/professional", label: t('professional'), icon: "bi-briefcase" },
    { path: "/personal", label: t('personal'), icon: "bi-journal-text" },
    { path: "/mood-checkin", label: t('moodCheckin'), icon: "bi-emoji-smile" }
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
                {t('settings')}
              </button>
              <hr className="dropdown-divider" />
              <button
                className="dropdown-item logout"
                onClick={onLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                {t('logout')}
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
          <h3 className="nav-menu-title">{t('menu')}</h3>
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
                <h3 className="settings-modal-title">{t('settings')}</h3>
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
                  <span>{t('theme')}</span>
                  <ThemeToggle size="small" />
                </div>
              </div>

              <div className="settings-modal-section">
                <h4 className="settings-section-title">{t('notifications')}</h4>
                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t('emailNotifications')}</span>
                    <small className="settings-sublabel">{t('receiveReminders')} {user?.email}</small>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-modal-section">
                <h4 className="settings-section-title">{t('diaryPreferences')}</h4>
                <div className="settings-row">
                  <div className="settings-label">
                    <span>{t('autoSaveDraft')}</span>
                    <small className="settings-sublabel">{t('autoSaveDescription')}</small>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={autoSaveDraft}
                      onChange={(e) => setAutoSaveDraft(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-modal-section">
                <h4 className="settings-section-title">{t('general')}</h4>
                <div className="settings-row">
                  <span>{t('language')}</span>
                  <select
                    className="settings-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                    <option value="ar">العربية</option>
                    <option value="hi">हिन्दी</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>

              <div className="settings-modal-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? t('saving') : t('save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
