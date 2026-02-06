// src/pages/Signup.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import auth from "../api/auth";

export default function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // ✅ ONE async submit function
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await auth.signup({ name, email, password });

      localStorage.setItem("mydiary_token", data.token);
      localStorage.setItem("mydiary_user", JSON.stringify(data.user));

      onSignup({ token: data.token, user: data.user });
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: 400 }}>
        <h4 className="text-center mb-4">Create Account</h4>

        <form onSubmit={submit}>
          <input
            ref={nameRef}
            type="text"
            className="form-control mb-3"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
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
            className="btn btn-success w-100"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Creating..." : "Sign Up"}
          </motion.button>
        </form>

        <div className="text-center mt-3">
          <Link to="/login">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}
