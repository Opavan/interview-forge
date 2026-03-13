import React from "react";
import "./ResultScreen.css";

const getDecisionColor = (d) => {
  if (d?.includes("Strong Hire")) return "#22c55e";
  if (d?.includes("Hire")) return "#86efac";
  if (d?.includes("Strong No")) return "#ef4444";
  return "#f97316";
};

const ResultsScreen = ({ results, config, onRetry, onReset }) => {
  const { company, level } = config;
  const { score = 0, strengths = [], improvements = [], decision, closing } = results;
  const decisionColor = getDecisionColor(decision);
  const circumference = 283;
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className="results">
      <div className="results-container">
        {/* Decision badge */}
        <div className="results-header">
          <div className="decision-badge" style={{ color: decisionColor, background: `${decisionColor}20`, border: `1px solid ${decisionColor}40` }}>
            {decision}
          </div>
          <h2 className="results-title">Interview Complete</h2>
          <p className="results-sub">{company.name} · {level} · Frontend</p>
        </div>

        {/* Score ring */}
        <div className="score-ring-wrapper">
          <svg width="160" height="160" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={decisionColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1.5s ease", filter: `drop-shadow(0 0 8px ${decisionColor})` }} />
          </svg>
          <div className="score-inner">
            <span className="score-number" style={{ color: decisionColor }}>{score}</span>
            <span className="score-label">/100</span>
          </div>
        </div>

        {/* Closing */}
        {closing && (
          <div className="closing-msg">"{closing}"</div>
        )}

        {/* Strengths & Improvements */}
        <div className="results-grid">
          <div className="result-card">
            <h3 className="card-label strengths-label">✓ Strengths</h3>
            {strengths.map((s, i) => (
              <div key={i} className="result-item">
                <span className="item-icon" style={{ color: "#22c55e" }}>+</span> {s}
              </div>
            ))}
          </div>
          <div className="result-card">
            <h3 className="card-label improve-label">↑ Improve</h3>
            {improvements.map((s, i) => (
              <div key={i} className="result-item">
                <span className="item-icon" style={{ color: "#f97316" }}>→</span> {s}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="results-actions">
          <button className="btn-secondary" onClick={onReset}>Try Another Company</button>
          <button className="btn-retry" onClick={onRetry}>Retry This Interview →</button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;