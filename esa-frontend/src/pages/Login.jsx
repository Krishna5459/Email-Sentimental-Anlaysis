import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import logo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ Save JWT
      localStorage.setItem("token", data.token);

      // ✅ Go to Inbox
      navigate("/inbox");
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* NAVBAR */}
      <nav className="auth-navbar">
        <div className="auth-nav-left" onClick={() => navigate("/")}>
          <img src={logo} alt="ESA Logo" />
          <span>ESA</span>
        </div>
      </nav>

      {/* LOGIN CARD */}
      <div className="auth-container">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to your ESA account</p>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}
