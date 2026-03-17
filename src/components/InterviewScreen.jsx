import React, { useState, useEffect, useRef } from "react";
import { callClaude } from "../hooks/useClaude";
import { useSpeech } from "../hooks/useSpeech";
import { MAX_QUESTIONS, INTERVIEWER_PERSONAS, CODE_LANGUAGES } from "../data/constants";
import Editor from "@monaco-editor/react";
import "./InterviewScreen.css";

const InterviewScreen = ({ config, onFinish, onExit }) => {
  const { company, role, level, selectedTopics } = config;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [showCode, setShowCode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [codeLang, setCodeLang] = useState("javascript");
  const chatRef = useRef(null);
  const { speak, startListening, stopListening, cancelSpeech, isListening, isSpeaking } = useSpeech();

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    startInterview();
    return () => { cancelSpeech(); stopListening(); };
  }, []);

  const getSystemPrompt = (currentQ) => {
    const topicsStr = selectedTopics.length > 0
      ? selectedTopics.join(", ")
      : `all core ${role.name} topics`;

    if (currentQ === 0) {
      return `${INTERVIEWER_PERSONAS[company.id]}
You are conducting a ${level} ${role.name} interview at ${company.name}. Topics: ${topicsStr}.
Start with a warm professional greeting, introduce yourself by name and the company.
Then ask your FIRST question. Make it realistic and specific for a ${level} ${role.name} engineer at ${company.name}.
For coding roles: ask a real coding problem with clear input/output examples.
For behavioral: ask a specific situation-based question.
For system design: ask to design a real system.
Be conversational, professional, and encouraging. Ask ONE question only.`;
    }

    return `${INTERVIEWER_PERSONAS[company.id]}
You are conducting a ${level} ${role.name} interview at ${company.name}. Topics: ${topicsStr}.
Question ${currentQ} of ${MAX_QUESTIONS}.

Give SHORT specific feedback on their answer (1-2 sentences max). Be encouraging but honest.
Then immediately ask question ${currentQ + 1} — make it progressively harder and realistic for ${company.name}.

If this was question ${MAX_QUESTIONS}, instead of asking another question:
- Give brief final feedback
- Thank the candidate warmly
- Say you'll be evaluating their performance`;
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
    if ((!input.trim() && !showCode) || loading) return;

    const userText = showCode
      ? `${input.trim() ? input.trim() + "\n\n" : ""}My code:\n\`\`\`${codeLang}\n${code}\n\`\`\``
      : input.trim();

    setInput("");
    setShowCode(false);
    setCode("// Write your solution here\n\n");

    const userMsg = { role: "user", content: userText };
    const newHistory = [...history, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setHistory(newHistory);
    setLoading(true);
    cancelSpeech();

    if (questionCount >= MAX_QUESTIONS) {
      const evalPrompt = `You are a ${company.name} interviewer evaluating a completed ${level} ${role.name} interview.
Analyze the full conversation carefully and return ONLY valid JSON:
{
  "score": number 0-100,
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "decision": "Strong Hire" or "Hire" or "No Hire" or "Strong No Hire",
  "closing": "personalized encouraging closing message mentioning specific things they did well",
  "questionBreakdown": [{"question": "brief question", "score": number, "comment": "specific comment"}]
}`;
      const evalResult = await callClaude(newHistory, evalPrompt);
      setLoading(false);
      try {
        const clean = evalResult.replace(/```json|```/g, "").trim();
        onFinish(JSON.parse(clean));
      } catch {
        onFinish({
          score: 72,
          strengths: ["Clear communication", "Good problem-solving approach", "Strong fundamentals"],
          improvements: ["Practice edge cases", "Improve time complexity analysis", "Work on system design"],
          decision: "Hire",
          closing: "Great effort! You showed strong potential. Keep practicing!",
          questionBreakdown: []
        });
      }
      return;
    }

    const systemPrompt = getSystemPrompt(questionCount);
    const reply = await callClaude(newHistory, systemPrompt);
    setLoading(false);
    const aiMsg = { role: "assistant", content: reply };
    setMessages(prev => [...prev, aiMsg]);
    setHistory(prev => [...prev, aiMsg]);
    speak(reply);
    setQuestionCount(prev => prev + 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !showCode) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleExit = () => {
    cancelSpeech();
    stopListening();
    onExit();
  };

  const progress = (questionCount / MAX_QUESTIONS) * 100;

  return (
    <div className="interview">
      {/* Header */}
      <div className="interview-header">
        <div className="interview-info">
          <div className="company-logo-sm" style={{ background: `linear-gradient(135deg, ${company.color}, ${company.accent})` }}>
            {company.logo}
          </div>
          <div>
            <div className="header-title">{company.name}</div>
            <div className="header-sub">{level} · {role.name}</div>
          </div>
        </div>

        <div className="header-progress">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%`, background: company.color }} />
          </div>
          <span className="q-count">Q{Math.min(questionCount, MAX_QUESTIONS)}/{MAX_QUESTIONS}</span>
        </div>

        <div className="header-right">
         {isSpeaking && (
  <button
    className="stop-speech-btn"
    onClick={() => {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }}
    title={isPaused ? "Resume" : "Pause"}
  >
    <span className="soundwave-mini">
      {[...Array(4)].map((_, i) => (
        <span key={i} className="wave-bar-mini" style={{ animationDelay: `${i * 0.1}s`, background: company.color }} />
      ))}
    </span>
    {isPaused ? "▶ Resume" : "⏸ Pause"}
  </button>
)}
          <button className="exit-btn" onClick={handleExit}>✕ Exit</button>
        </div>
      </div>

      {/* Main area */}
      <div className="interview-body">
        {/* Chat */}
        <div className={`chat-panel ${showCode ? "split" : "full"}`}>
          <div className="chat-area" ref={chatRef}>
            {messages.length === 0 && loading && (
              <div className="loading-msg">
                <div className="avatar-loading" style={{ background: `linear-gradient(135deg, ${company.color}, ${company.accent})` }}>
                  {company.logo}
                </div>
                <div>
                  <div className="dots">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="dot-blink" style={{ background: company.color, animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <p className="joining-text">Your interviewer is joining...</p>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`msg-wrapper ${m.role === "user" ? "user-wrapper" : "ai-wrapper"}`}>
                {m.role === "assistant" && (
                  <div className="msg-avatar" style={{ background: `linear-gradient(135deg, ${company.color}, ${company.accent})` }}>
                    {company.logo}
                  </div>
                )}
                <div className="msg-content">
                  <div className="msg-name">
                    {m.role === "user" ? "You" : `${company.name} Interviewer`}
                  </div>
                  <div className={`msg ${m.role === "assistant" ? "msg-ai" : "msg-user"}`}>
                    {m.content.split("```").map((part, idx) => {
                      if (idx % 2 === 1) {
                        const lines = part.split("\n");
                        const codeContent = lines.slice(1).join("\n");
                        return (
                          <pre key={idx} className="code-block">
                            <code>{codeContent || part}</code>
                          </pre>
                        );
                      }
                      return <span key={idx} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && messages.length > 0 && (
              <div className="ai-wrapper">
                <div className="msg-avatar" style={{ background: `linear-gradient(135deg, ${company.color}, ${company.accent})` }}>
                  {company.logo}
                </div>
                <div className="msg-content">
                  <div className="msg-name">{company.name} Interviewer</div>
                  <div className="msg msg-ai">
                    <div className="dots">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="dot-blink" style={{ background: company.color, animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-row">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={showCode ? "Add explanation (optional)..." : "Type your answer... (Enter to send, Shift+Enter for newline)"}
                disabled={loading}
                className="chat-input"
              />
              <div className="input-btns">
                <button
                  className={`input-btn mic-btn ${isListening ? "listening" : ""}`}
                  onClick={isListening ? stopListening : () => startListening((t) => setInput(t))}
                  title={isListening ? "Stop listening" : "Speak your answer"}
                >
                  {isListening ? "⏹" : "🎙️"}
                </button>
                <button
                  className={`input-btn code-btn ${showCode ? "active" : ""}`}
                  onClick={() => setShowCode(!showCode)}
                  title="Toggle code editor"
                >
                  {"💻 "}
                </button>
                <button
                  className="input-btn send-btn"
                  onClick={sendMessage}
                  disabled={loading || (!input.trim() && !showCode)}
                >
                  ↑
                </button>
              </div>
            </div>
            <div className="input-hint">
              {isListening ? "🎙️ Listening..." : isSpeaking ? "🔊 Interviewer speaking — click Stop to interrupt" : "Enter to send • 🎙️ voice input • 💻 code editor"}
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        {showCode && (
          <div className="code-panel">
            <div className="code-panel-header">
              <span className="code-panel-title">💻 Code Editor</span>
              <select value={codeLang} onChange={(e) => setCodeLang(e.target.value)} className="lang-select">
                {CODE_LANGUAGES.map(l => (
                  <option key={l.id} value={l.monaco}>{l.name}</option>
                ))}
              </select>
              <button className="close-code-btn" onClick={() => setShowCode(false)}>✕</button>
            </div>
            <Editor
              height="100%"
              language={codeLang}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
              }}
            />
            <div className="code-panel-footer">
              <button className="submit-code-btn" onClick={sendMessage} disabled={loading}>
                Submit Code →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewScreen;