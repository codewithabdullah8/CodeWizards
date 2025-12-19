import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import API from "./api";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DiaryEntry from "./pages/DiaryEntry";
import Personal from "./pages/Personal";
import ProfessionalHome from "./pages/ProfessionalDiary/Home";
import Schedule from "./pages/Schedule";

// ✅ Protected route wrapper
function Protected({ children }) {
  const token = localStorage.getItem("mydiary_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("mydiary_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  // ✅ Check today's reminder after login
  useEffect(() => {
    if (!user) return;

    API.get("/reminders/today")
      .then(({ data }) => {
        if (data?.message) {
          alert(data.message);
        }
      })
      .catch(() => {
        // silently ignore
      });
  }, [user]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("mydiary_token");
    localStorage.removeItem("mydiary_user");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      {/* Navbar always visible */}
      <NavBar user={user} onLogout={handleLogout} />

      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        {/* Personal Diary */}
        <Route
          path="/personal"
          element={
            <Protected>
              <Personal />
            </Protected>
          }
        />

        {/* Professional Diary */}
        <Route
          path="/professional"
          element={
            <Protected>
              <ProfessionalHome />
            </Protected>
          }
        />

        {/* Schedule */}
        <Route
          path="/schedule"
          element={
            <Protected>
              <Schedule />
            </Protected>
          }
        />

        {/* Single diary entry */}
        <Route
          path="/entry/:id"
          element={
            <Protected>
              <DiaryEntry />
            </Protected>
          }
        />

        {/* Auth */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={(res) => {
                setUser(res.user);
                navigate("/");
              }}
            />
          }
        />

        <Route
          path="/signup"
          element={
            <Signup
              onSignup={(res) => {
                setUser(res.user);
                navigate("/");
              }}
            />
          }
        />

        {/* Catch-all (keep LAST) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}