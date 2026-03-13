import React, { useState } from "react";
import { COMPANIES, TOPICS, LEVELS } from "../data/constants";
import "./SetupScreen.css";

const SetupScreen = ({ onStart, onBack }) => {
  const [company, setCompany] = useState(null);
  const [level, setLevel] = useState("Mid-level");
  const [selectedTopics, setSelectedTopics] = useState([]);

  const toggleTopic = (t) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleStart = () => {
    if (!company) return;
    onStart({ company, level, selectedTopics });
  };

  return (
    <div className="setup">
      <div className="setup-container">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <h2 className="setup-title">Configure Your Interview</h2>
        <p className="setup-sub">Choose your company environment and preferences</p>

        {/* Company */}
        <div className="section">
          <h3 className="section-label">Company Environment</h3>
          <div className="company-grid">
            {COMPANIES.map((c) => (
              <div
                key={c.id}
                className={`company-card ${company?.id === c.id ? "selected" : ""}`}
                style={{
                  borderColor: company?.id === c.id ? c.color : "rgba(255,255,255,0.08)",
                  boxShadow: company?.id === c.id ? `0 0 30px ${c.color}30` : "none",
                }}
                onClick={() => setCompany(c)}
              >
                <div
                  className="company-logo"
                  style={{ background: `linear-gradient(135deg, ${c.color}, ${c.accent})` }}
                >
                  {c.logo}
                </div>
                <div className="company-name">{c.name}</div>
              </div>
            ))}
          </div>
          {company && (
            <p className="company-vibe">Vibe: {company.vibe}</p>
          )}
        </div>

        {/* Level */}
        <div className="section">
          <h3 className="section-label">Experience Level</h3>
          <div className="level-group">
            {LEVELS.map((l) => (
              <button
                key={l}
                className={`level-btn ${level === l ? "active" : ""}`}
                onClick={() => setLevel(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="section">
          <h3 className="section-label">
            Topics <span className="optional">(leave empty for all)</span>
          </h3>
          <div className="topics-group">
            {TOPICS.map((t) => (
              <button
                key={t}
                className={`topic-chip ${selectedTopics.includes(t) ? "active" : ""}`}
                onClick={() => toggleTopic(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-start"
          disabled={!company}
          onClick={handleStart}
        >
          {!company ? "Select a company to continue" : `Start ${company.name} Interview →`}
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;