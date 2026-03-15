import React, { useState } from "react";
import { COMPANIES, ROLES, TOPICS, LEVELS } from "../data/constants";
import "./SetupScreen.css";

const SetupScreen = ({ onStart, onBack }) => {
  const [company, setCompany] = useState(null);
  const [role, setRole] = useState(null);
  const [level, setLevel] = useState("Mid-level");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [step, setStep] = useState(1); // 1=company, 2=role, 3=topics

  const toggleTopic = (t) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleStart = () => {
    if (!company || !role) return;
    onStart({ company, role, level, selectedTopics });
  };

  const availableTopics = role ? TOPICS[role.id] || [] : [];

  return (
    <div className="setup">
      <div className="setup-container">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="setup-title">Configure Your Interview</h2>
        <p className="setup-sub">Customize your interview experience</p>

        {/* Step indicators */}
        <div className="steps">
          {["Company", "Role & Level", "Topics"].map((s, i) => (
            <div key={s} className={`step ${step > i ? "done" : ""} ${step === i + 1 ? "active" : ""}`} onClick={() => setStep(i + 1)}>
              <div className="step-num">{step > i + 1 ? "✓" : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
          ))}
        </div>

        {/* Step 1 — Company */}
        {step === 1 && (
          <div className="section">
            <h3 className="section-label">Choose Company Environment</h3>
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
                  <div className="company-logo" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.accent})` }}>
                    {c.logo}
                  </div>
                  <div className="company-name">{c.name}</div>
                </div>
              ))}
            </div>
            {company && <p className="company-vibe">🎯 Vibe: {company.vibe}</p>}
            <button className="btn-next" disabled={!company} onClick={() => setStep(2)}>
              Next: Choose Role →
            </button>
          </div>
        )}

        {/* Step 2 — Role & Level */}
        {step === 2 && (
          <div className="section">
            <h3 className="section-label">Choose Role</h3>
            <div className="roles-grid">
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  className={`role-card ${role?.id === r.id ? "selected" : ""}`}
                  onClick={() => { setRole(r); setSelectedTopics([]); }}
                >
                  <span className="role-icon">{r.icon}</span>
                  <span className="role-name">{r.name}</span>
                  <span className="role-desc">{r.desc}</span>
                </div>
              ))}
            </div>

            <h3 className="section-label" style={{ marginTop: "2rem" }}>Experience Level</h3>
            <div className="level-group">
              {LEVELS.map((l) => (
                <button key={l} className={`level-btn ${level === l ? "active" : ""}`} onClick={() => setLevel(l)}>
                  {l}
                </button>
              ))}
            </div>

            <div className="step-btns">
              <button className="btn-back-step" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-next" disabled={!role} onClick={() => setStep(3)}>
                Next: Topics →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Topics */}
        {step === 3 && (
          <div className="section">
            <h3 className="section-label">
              Focus Topics <span className="optional">(leave empty for all)</span>
            </h3>
            <div className="topics-group">
              {availableTopics.map((t) => (
                <button
                  key={t}
                  className={`topic-chip ${selectedTopics.includes(t) ? "active" : ""}`}
                  onClick={() => toggleTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="step-btns">
              <button className="btn-back-step" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-start" disabled={!company || !role} onClick={handleStart}>
                Start {company?.name} {role?.name} Interview →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupScreen;