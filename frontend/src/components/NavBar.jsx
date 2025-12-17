// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mydiary_token");
    setLoggedIn(!!token);
  }, [location.pathname]); // re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem("mydiary_token");
    localStorage.removeItem("mydiary_user");
    setLoggedIn(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>MyDiary</h2>

      <div style={styles.links}>
        {/* Personal, Professional, Schedule */}
        <Link
          style={{ 
            ...styles.link, 
            ...(isActive("/personal") ? styles.activeLink : {}) 
          }}
          to="/personal"
        >
          Personal
        </Link>

        <Link
          style={{ 
            ...styles.link, 
            ...(isActive("/professional") ? styles.activeLink : {}) 
          }}
          to="/professional"
        >
          Professional
        </Link>

        <Link
          style={{ 
            ...styles.link, 
            ...(isActive("/schedule") ? styles.activeLink : {}) 
          }}
          to="/schedule"
        >
          Schedule
        </Link>

        {/* Auth buttons on the right */}
        {loggedIn ? (
          <button style={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link style={styles.link} to="/login">
              Login
            </Link>
            <Link style={styles.link} to="/signup">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    padding: "12px 20px",
    background: "#2C3E50",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
  },
  logo: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    padding: "6px 10px",
    borderRadius: "6px",
  },
  activeLink: {
    backgroundColor: "#1ABC9C",
  },
  logout: {
    background: "#E74C3C",
    border: "none",
    padding: "6px 12px",
    color: "white",
    cursor: "pointer",
    borderRadius: "5px",
    fontSize: "14px",
  },
};
