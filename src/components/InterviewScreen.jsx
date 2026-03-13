import React, { useState, useEffect, useRef } from "react";
import { callClaude } from "../hooks/useClaude";
import { useSpeech } from "../hooks/useSpeech";
import { MAX_QUESTIONS, INTERVIEWER_PERSONAS } from "../data/constants";
import "./InterviewScreen.css";

const InterviewScreen = ({ config, onFinish, onExit }) => {
  const { company, level, selectedTopics } = config;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [history, setHistory] = useState([]);
  const chatRef = useRef(null);
  const { speak, startListening, stopListening, isListening, isSpeaking } = useSpeech();

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    startInterview();
    // eslint-disable-next-line
  }, []);

  const getSystemPrompt = (currentQ) => {
    const topicsStr = selectedTopics.length > 0 ? selectedTopics.join(", ") : "JavaScript, React, CSS, HTML, Performance, Accessibility, Browser APIs, TypeScript";
    if (currentQ === 0) {
      return `${INTERVIEWER_PERSONAS[company.id]}
You are conducting a ${level} frontend interview. Topics: ${topicsStr}. Company vibe: ${company.vibe}.
Start with a warm greeting introducing yourself and the company, then ask question 1 of ${MAX_QUESTIONS}. Ask ONE question only.`;
    }
    return `${INTERVIEWER_PERSONAS[company.id]}
You are conducting a ${level} frontend interview. Topics: ${topicsStr}. Company vibe: ${company.vibe}.
This is question ${currentQ} of ${MAX_QUESTIONS}.
Give brief feedback on the candidate's answer (1-2 sentences), then ask question ${currentQ + 1}.
If this was question ${MAX_QUESTIONS}, wrap up the interview warmly instead.`;
  };

  const startInterview = async () => {
    setLoading(true);
    const systemPrompt = getSystemPrompt(0);
    const initMsg = [{ role: "user", content: "Start the interview now." }];
    const reply = await callClaude(initMsg, systemPrompt);
    setLoading(false);
    const aiMsg = { role: "assistant", content: reply };
    setMessages([aiMsg]);
    setHistory([...initMsg, aiMsg]);
    speak(reply);
    setQuestionCount(1);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const userMsg = { role: "user", content: userText };
    const newHistory = [...history, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setHistory(newHistory);
    setLoading(true);

    if (questionCount >= MAX_QUESTIONS) {
      // Ask for evaluation
      const evalPrompt = `You are a ${company.name} interviewer who just completed a ${level} frontend interview.
Evaluate the conversation and return ONLY valid JSON (no markdown, no backticks):
{
  "score": number between 0 and 100,
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "decision": "Strong Hire" or "Hire" or "No Hire" or "Strong No Hire",
  "closing": "a short encouraging closing message"
}`;
      const evalResult = await callClaude(newHistory, evalPrompt);
      setLoading(false);
      try {
        const clean = evalResult.replace(/```json|```/g, "").trim();
        onFinish(JSON.parse(clean));
      } catch {
        onFinish({ score: 70, strengths: ["Good communication"], improvements: ["Practice more"], decision: "Hire", closing: "Great effort!" });
      }
      return;
    }

    const systemPrompt = getSystemPrompt(questionCount);
    const reply = await callClaude(newHistory, systemPrompt);
    setLoading(false);
    const aiMsg = { role: "assistant", content: reply };
    setMessages((prev) => [...prev, aiMsg]);
    setHistory((prev) => [...prev, aiMsg]);
    speak(reply);
    setQuestionCount((prev) => prev + 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="interview">
      {/* Header */}
      <div className="interview-header">
        <div className="interview-info">
          <div className="company-logo-sm" style={{ background: `linear-gradient(135deg, ${company.color}, ${company.accent})` }}>
            {company.logo}
          </div>
          <div>
            <div className="header-title">{company.name} Interview</div>
            <div className="header-sub">{level} · Frontend</div>
          </div>
        </div>
        <div className="header-right">
          {isSpeaking && (
            <div className="soundwave">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s`, background: company.color }} />
              ))}
            </div>
          )}
          <div className="q-count">Q {Math.min(questionCount, MAX_QUESTIONS)}/{MAX_QUESTIONS}</div>
          <div className="progress-dots">
            {[...Array(MAX_QUESTIONS)].map((_, i) => (
              <div key={i} className="dot" style={{ background: i < questionCount ? company.color : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
          <button className="exit-btn" onClick={onExit}>Exit</button>
        </div>
      </div>

      {/* Chat */}
      <div className="chat-area" ref={chatRef}>
        {messages.length === 0 && loading && (
          <div className="loading-msg">
            <div className="dots">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="dot-blink" style={{ background: company.color, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            Your interviewer is joining...
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className="msg-wrapper">
            <div className={`msg-label ${m.role}`}>
              {m.role === "user" ? "You" : `${company.name} Interviewer`}
            </div>
            <div className={`msg ${m.role === "assistant" ? "msg-ai" : "msg-user"}`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && messages.length > 0 && (
          <div className="dots inline-dots">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="dot-blink" style={{ background: company.color, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-area">
        <div className="input-row">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here... (Enter to send, Shift+Enter for new line)"
            disabled={loading}
            className="chat-input"
          />
          <div className="input-btns">
            <button
              className={`mic-btn ${isListening ? "listening" : ""}`}
              onClick={isListening ? stopListening : () => startListening((t) => setInput(t))}
              title="Speak your answer"
            >
              {isListening ? "⏹" : "🎙️"}
            </button>
            <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>→</button>
          </div>
        </div>
        <div className="input-hint">
          {isSpeaking ? "🔊 Interviewer speaking..." : "Press Enter to send • 🎙️ to speak your answer"}
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;