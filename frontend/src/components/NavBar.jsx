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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={loggedIn ? "/" : "/login"}>
          <i className="bi bi-journal-bookmark me-2"></i>
          MyDiary
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {loggedIn && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/professional") ? "active" : ""}`}
                    to="/professional"
                  >
                    <i className="bi bi-briefcase me-1"></i>
                    Professional
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/personal") ? "active" : ""}`}
                    to="/personal"
                  >
                    <i className="bi bi-person me-1"></i>
                    Personal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/schedule") ? "active" : ""}`}
                    to="/schedule"
                  >
                    <i className="bi bi-calendar-event me-1"></i>
                    Schedule
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {loggedIn ? (
              <li className="nav-item">
                <button
                  className="btn btn-outline-light ms-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary ms-2" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
