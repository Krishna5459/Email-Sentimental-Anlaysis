import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import logo from "../assets/logo.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // ===== FRONTEND VALIDATION =====
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Account created successfully. Please login.");
      navigate("/login");
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

      {/* REGISTER CARD */}
      <div className="auth-container">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          Sign up to start using Email Sentiment Analysis
        </p>

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
