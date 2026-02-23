import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return;

    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then(user => {
        localStorage.setItem("mydiary_token", token);
        localStorage.setItem("mydiary_user", JSON.stringify(user));

        // ✅ CRITICAL: Pass both token and user to onLogin callback
        if (onLogin) {
          onLogin({ token, user });
        } else {
          navigate("/", { replace: true });
        }
      })
      .catch(err => {
        console.error("OAuth error:", err);
        navigate("/login", { replace: true });
      });
  }, [navigate, onLogin]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      fontSize: "1.2em"
    }}>
      <p>Signing you in...</p>
    </div>
  );
}
