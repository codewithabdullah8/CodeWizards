// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import auth from "../api/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // ✅ async function (await is valid here)
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await auth.login({ email, password });

      localStorage.setItem("mydiary_token", data.token);
      localStorage.setItem("mydiary_user", JSON.stringify(data.user));

      onLogin({ token: data.token, user: data.user });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("mydiary_token", token);
    window.location.href = "/";
  }
}, []);


  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: 380 }}>
        <h4 className="text-center mb-4">Sign In</h4>

        {/* ✅ GOOGLE LOGIN */}
        
        <button
  type="button"
  onClick={() => {
    window.location.href = "http://localhost:5000/api/auth/google";
  }}
>
  Continue with Google
</button>



        <div className="text-center text-muted mb-2">OR</div>

        {/* EMAIL LOGIN */}
        <form onSubmit={submit}>
          <input
            ref={emailRef}
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="alert alert-danger">{error}</div>}

          <motion.button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <div className="text-center mt-3">
          <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
