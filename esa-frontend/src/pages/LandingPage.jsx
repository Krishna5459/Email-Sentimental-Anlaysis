import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
import logo from "../assets/logo.png"; // 👈 add your logo here

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <section className="landing-root">
      <div className="landing-inner">

        {/* LOGO */}
        <img
          src={logo}
          alt="ESA Logo"
          className="landing-logo"
        />

        <h1 className="landing-title">
          Email Sentiment Analysis
        </h1>

        <p className="landing-subtitle">
          Understand how people truly feel about your emails using
          AI-powered sentiment analysis. Instantly identify positive,
          neutral, and negative responses and take action with confidence.
        </p>

        <div className="landing-points">
          <div className="landing-point">Analyze multiple email responses at once</div>
          <div className="landing-point">Clear sentiment breakdown with AI recommendations</div>
          <div className="landing-point">Identify dissatisfaction early</div>
          <div className="landing-point">Save and review analysis anytime</div>
        </div>

        {/* CTA WRAPPER */}
        <div className="landing-cta-wrap">
          <button
            className="landing-cta"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>

      </div>
    </section>
  );
}
