import React from "react";
import "./LandingScreen.css";

const LandingScreen = ({ onStart }) => {
  return (
    <div className="landing">
      <div className="grid-bg" />
      <div className="glow-orb orb-top" />
      <div className="glow-orb orb-bottom" />

      <div className="landing-content">
        <div className="badge">
          <span className="badge-dot" />
          AI-Powered Interview Simulator
        </div>

        <h1 className="landing-title">InterviewForge</h1>

        <p className="landing-sub">
          Real company environments. Real AI interviewers.<br />
          Frontend interviews that actually prepare you.
        </p>

        <div className="features">
          {["🏢 Company Environments", "🎙️ Voice + Text", "🤖 AI Interviewer", "📊 Instant Feedback"].map((f) => (
            <div className="feature-chip" key={f}>{f}</div>
          ))}
        </div>

        <button className="btn-primary" onClick={onStart}>
          Start Interview →
        </button>
      </div>
    </div>
  );
};

export default LandingScreen;