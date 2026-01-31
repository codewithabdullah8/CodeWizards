import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import NavBar from "./components/NavBar";
import API from "./api";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DiaryEntry from "./pages/DiaryEntry";
import Personal from "./pages/Personal";
import ProfessionalHome from "./pages/ProfessionalDiary/Home";
import Schedule from "./pages/Schedule";
import ProfessionalNewEntry from "./pages/ProfessionalDiary/NewEntry";
import ProfessionalViewEntry from "./pages/ProfessionalDiary/ViewEntry";
import RecentEntries from "./pages/RecentEntries";


// ✅ Protected route wrapper
function Protected({ children }) {
  const token = localStorage.getItem("mydiary_token");
  const storedUser = localStorage.getItem("mydiary_user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("mydiary_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  // Bootstrap tooltips are handled automatically with data-bs-toggle attributes
  // No manual initialization needed in Bootstrap 5

  // ✅ Check today's reminder after login (popup removed)
  useEffect(() => {
    if (!user) return;

    API.get("/reminders/today")
      .then(({ data }) => {
        if (data?.message) {
          // alert(data.message); // Removed popup as requested
          console.log("Reminder:", data.message); // Log to console instead
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
    <ToastProvider>
      <ThemeProvider>
      {/* Navbar always visible */}
     {user && <NavBar user={user} onLogout={handleLogout} />}         

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

        {/* Recent Entries */}
        <Route
          path="/recent"
          element={
            <Protected>
              <RecentEntries />
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
        {/* Professional Diary */}
<Route
  path="/professional"
  element={
    <Protected>
      <ProfessionalHome />
    </Protected>
  }
/>

<Route
  path="/professional/new"
  element={
    <Protected>
      <ProfessionalNewEntry />
    </Protected>
  }
/>

<Route
  path="/professional/entry/:id"
  element={
    <Protected>
      <ProfessionalViewEntry />
    </Protected>
  }
/>


        {/* Catch-all (keep LAST) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ThemeProvider>
    </ToastProvider>
  );
}