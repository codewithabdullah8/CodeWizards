import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return;

    localStorage.setItem("mydiary_token", token);

    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(user => {
        localStorage.setItem("mydiary_user", JSON.stringify(user));

        // 🔥 THIS WAS MISSING
        if (onLogin) onLogin(user);

        navigate("/");
      });
  }, [navigate, onLogin]);

  return <p>Signing you in...</p>;
}
