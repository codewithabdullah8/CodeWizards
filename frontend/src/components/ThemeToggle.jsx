import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '', size = 'normal' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    small: 'theme-toggle-small',
    normal: 'theme-toggle-normal',
    large: 'theme-toggle-large'
  };

  return (
    <button
      className={`theme-toggle ${sizeClasses[size]} ${className}`}
      onClick={toggleTheme}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <i className={`bi ${isDarkMode ? 'bi-sun' : 'bi-moon'}`}></i>
      {size !== 'small' && (
        <span className="theme-toggle-text">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;