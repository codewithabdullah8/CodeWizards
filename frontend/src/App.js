import React, { useEffect, useState, useCallback } from "react";
import OAuthSuccess from "./pages/oAuthSuccess";

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
import ProfessionalNewEntry from "./pages/ProfessionalDiary/NewEntry";
import ProfessionalViewEntry from "./pages/ProfessionalDiary/ViewEntry";
import RecentEntries from "./pages/RecentEntries";
import MoodCheckin from "./pages/MoodCheckin";
import ScheduleView from "./pages/ScheduleView";


// ✅ Protected route wrapper - checks if user is authenticated
function Protected({ children }) {
  const token = localStorage.getItem("mydiary_token");
  const storedUser = localStorage.getItem("mydiary_user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ✅ Auth route wrapper - redirects logged-in users away from login/signup
function AuthRoute({ children }) {
  const token = localStorage.getItem("mydiary_token");
  const storedUser = localStorage.getItem("mydiary_user");

  if (token && storedUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div style={{
      position: "fixed",
      top: "64px",
      width: "100%",
      background: "#ff4d4f",
      color: "white",
      textAlign: "center",
      padding: "8px",
      zIndex: 900
    }}>
      ⚠ You are offline. Some features may not work.
    </div>
  );
}

// ✅ AppContent component that uses hooks inside Provider
function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("mydiary_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ✅ Check today's reminder after login (popup removed)
  useEffect(() => {
    if (!user) return;

    API.get("/reminders/today")
      .then(({ data }) => {
        if (data?.message) {
          console.log("Reminder:", data.message);
        }
      })
      .catch(() => {  
        // silently ignore
      });
  }, [user]);

  // ✅ Logout - navigate to login with state reset
  const handleLogout = useCallback(() => {
    localStorage.removeItem("mydiary_token");
    localStorage.removeItem("mydiary_user");
    localStorage.removeItem("mydiary_email");
    localStorage.removeItem("mydiary_remember");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // ✅ Callback for successful login - navigate without page reload
  const handleLoginSuccess = useCallback((data) => {
    // data has { token, user }
    localStorage.setItem("mydiary_token", data.token);
    localStorage.setItem("mydiary_user", JSON.stringify(data.user));
    setUser(data.user);
    navigate("/", { replace: true });
  }, [navigate]);

  // ✅ Callback for successful signup - navigate without page reload
  const handleSignupSuccess = useCallback((data) => {
    // data has { token, user }
    localStorage.setItem("mydiary_token", data.token);
    localStorage.setItem("mydiary_user", JSON.stringify(data.user));
    setUser(data.user);
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <ToastProvider>
      <ThemeProvider>
        <OfflineBanner />
      
        {/* Navbar visible only when user is logged in */}
        {user && <NavBar user={user} onLogout={handleLogout} />}         

        <Routes>
          {/* ===== PROTECTED ROUTES (require authentication) ===== */}
          
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />

          <Route
            path="/personal"
            element={
              <Protected>
                <Personal />
              </Protected>
            }
          />

          <Route
            path="/recent"
            element={
              <Protected>
                <RecentEntries />
              </Protected>
            }
          />

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
          <Route
            path="/schedule/item/:id"
            element={
              <Protected>
                <ScheduleView />
              </Protected>
            }
          />

          <Route
            path="/entry/:id"
            element={
              <Protected>
                <DiaryEntry />
              </Protected>
            }
          />

          {/* ===== AUTH ROUTES (redirects away if already logged in) ===== */}

          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login onLogin={handleLoginSuccess} />
              </AuthRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup onSignup={handleSignupSuccess} />
              </AuthRoute>
            }
          />

          <Route
            path="/oauth-success"
            element={
              <OAuthSuccess onLogin={handleLoginSuccess} />
            }
          />
          <Route
  path="/mood-checkin"
  element={
    <Protected>
      <MoodCheckin />
    </Protected>
  }
/>  


          {/* ===== CATCH-ALL (keep LAST) ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </ToastProvider>
  );
}

export default function App() {
  return <AppContent />;
}