import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DiaryEntry from './pages/DiaryEntry';
import NavBar from './components/NavBar';
import API from './api';

// ✅ Protect routes: only allow access if token exists
function Protected({ children }) {
  const token = localStorage.getItem('mydiary_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('mydiary_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  // ✅ Check reminders on login
  useEffect(() => {
    if (!user) return;
    API.get('/reminders/today')
      .then(({ data }) => {
        if (data) alert(data.message);
      })
      .catch(() => {
        // ignore errors silently
      });
  }, [user]);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem('mydiary_token');
    localStorage.removeItem('mydiary_user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} />

      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
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
        <Route
          path="/login"
          element={
            <Login
              onLogin={(res) => {
                setUser(res.user);
                navigate('/');
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
                navigate('/');
              }}
            />
          }
        />
        {/* ✅ Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
