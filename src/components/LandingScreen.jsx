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
          Interviews that actually get you hired.
        </p>

        <div className="features">
          {[
            { icon: "🏢", text: "6 Company Environments" },
            { icon: "🎙️", text: "Voice + Text Input" },
            { icon: "🤖", text: "AI Interviewer" },
            { icon: "💻", text: "Live Code Editor" },
            { icon: "📊", text: "Detailed Feedback" },
            { icon: "🧠", text: "All Roles Supported" },
          ].map((f) => (
            <div className="feature-chip" key={f.text}>
              <span>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onStart}>
          Start Interview →
        </button>

        <p className="landing-note">No signup required • Free forever</p>
      </div>
    </div>
  );
};

export default LandingScreen;