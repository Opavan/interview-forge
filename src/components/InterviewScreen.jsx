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

    const difficultyMap = {
      "Junior": "easy to medium — focus on fundamentals and basic problem solving",
      "Mid-level": "medium — balance theory, practical, and some challenging problems",
      "Senior": "medium to hard — deep dives, edge cases, architecture, optimization",
      "Staff": "hard — system design, leadership, complex tradeoffs, scaling"
    };

    const questionStyleMap = {
      "frontend": [
        "Ask about JavaScript fundamentals (closures, promises, event loop, hoisting, or prototypes) — pick one specific concept and go deep",
        "Ask a React question (hooks rules, re-render optimization, reconciliation, useEffect pitfalls, or state management)",
        "Ask a CSS layout or specificity question — give a real scenario to solve",
        "Give a real debugging scenario — show broken code and ask them to find and fix the bug",
        "Ask about web performance optimization (lazy loading, code splitting, memoization, or caching)",
        "Ask about accessibility, browser APIs, or TypeScript — pick one and go specific",
      ],
      "backend": [
        "Ask about REST API design — give a real scenario and ask how they'd design the endpoints",
        "Ask about database design or query optimization with a concrete example",
        "Ask about authentication, JWT, sessions, or OAuth with a real use case",
        "Ask about caching strategies — Redis, CDN, or in-memory with tradeoffs",
        "Ask about handling race conditions, concurrency, or background jobs",
        "Ask about microservices vs monolith — give a scenario and ask for their recommendation",
      ],
      "dsa": [
        "Give a classic array or string problem (two sum, sliding window, or anagram) with clear input/output examples",
        "Ask about time and space complexity — show code and ask them to analyze it",
        "Give a linked list or stack/queue problem with examples",
        "Give a binary tree problem (traversal, height, or path sum)",
        "Give a dynamic programming problem (coin change, climbing stairs, or knapsack)",
        "Give a graph problem (BFS/DFS, number of islands, or shortest path)",
      ],
      "fullstack": [
        "Ask how they'd architect a full feature end to end — give a real product scenario",
        "Ask about state management across frontend and backend with a specific example",
        "Ask about API design, error handling, and validation",
        "Ask about database schema design for a real feature like a social feed",
        "Ask about deployment, CI/CD, and environment management",
        "Ask about security — XSS, CSRF, SQL injection, or rate limiting",
      ],
      "system": [
        "Ask to design a URL shortener like bit.ly — cover storage, hashing, redirects",
        "Ask to design a notification system for millions of users",
        "Ask to design a rate limiter — cover algorithms and distributed scenarios",
        "Ask about database sharding and replication strategies",
        "Ask to design a real-time chat system like WhatsApp",
        "Ask about load balancing, CDN, and horizontal scaling strategies",
      ],
      "behavioral": [
        "Ask about a time they handled a conflict with a teammate — use STAR format",
        "Ask about their biggest technical failure and what they learned from it",
        "Ask about a time they had to make a difficult decision with incomplete information",
        "Ask about how they prioritize when multiple urgent tasks compete for attention",
        "Ask about a time they disagreed with their manager and how they handled it",
        "Ask about their proudest technical achievement and the impact it had",
      ],
      "python": [
        "Ask about Python memory management, garbage collection, or reference counting",
        "Ask about decorators — explain with a real use case and ask them to write one",
        "Ask about generators vs lists — when to use each with examples",
        "Ask about async/await in Python — event loop and when to use it",
        "Give a real coding problem to solve in Python with examples",
        "Ask about Python's GIL, threading vs multiprocessing, or concurrency",
      ],
      "java": [
        "Ask about JVM internals — heap, stack, garbage collection algorithms",
        "Ask about Java collections — HashMap internals, TreeMap vs HashMap, ArrayList vs LinkedList",
        "Ask about multithreading — synchronized, locks, or thread pools",
        "Ask about design patterns — give a scenario and ask which pattern fits and why",
        "Ask about Spring Boot — dependency injection, beans, or REST controller setup",
        "Give a coding problem to solve in Java — focus on OOP principles",
      ],
    };

    const styles = questionStyleMap[role.id] || questionStyleMap["frontend"];
    const questionStyle = styles[Math.min(currentQ, styles.length - 1)];
    const difficulty = difficultyMap[level] || "medium difficulty";

    if (currentQ === 0) {
      return `${INTERVIEWER_PERSONAS[company.id]}

You are conducting a REAL ${level} ${role.name} interview at ${company.name}.
Difficulty level: ${difficulty}
Topics to cover: ${topicsStr}
Company culture: ${company.vibe}

STRICT INSTRUCTIONS:
1. Greet the candidate warmly and professionally. Introduce yourself by first name only.
2. Briefly say what the interview will cover (1 sentence).
3. Ask your FIRST question following this exact style: ${questionStyle}
4. For DSA/coding questions: give a clear problem statement with 2 input/output examples. Mention constraints.
5. For behavioral: prompt them to use STAR format (Situation, Task, Action, Result).
6. For system design: give a specific system to design with scale requirements.
7. Sound like a real senior engineer — conversational, not robotic.
8. Do NOT ask multiple questions. ONE question only.
9. Do NOT explain what you're going to ask. Just ask it directly after the greeting.

Start the interview now.`;
    }

    return `${INTERVIEWER_PERSONAS[company.id]}

You are conducting a REAL ${level} ${role.name} interview at ${company.name}.
Difficulty: ${difficulty}
This is question ${currentQ + 1} of ${MAX_QUESTIONS}.
Next question style: ${questionStyle}

STRICT INSTRUCTIONS:
1. Give SPECIFIC honest feedback on their previous answer (1-2 sentences ONLY).
   - If answer was good: mention exactly what was strong (e.g. "Great — you correctly identified the O(n) complexity and mentioned the edge case for empty arrays.")
   - If answer was partial: mention what was missing (e.g. "Good start, but you missed handling the null case.")
   - If answer was wrong: gently correct (e.g. "Not quite — closures capture variables by reference, not by value. Let me show you...")
2. Use a natural transition phrase (e.g. "Alright, let's move on.", "Good, next question.", "Let's try something different.")
3. Ask question ${currentQ + 1} following this style: ${questionStyle}
4. Make it ${currentQ >= 3 ? "noticeably harder" : "slightly more challenging"} than the previous question.
5. For coding problems: include clear input/output examples and mention any constraints.
6. Sound natural and professional — like a real engineer having a conversation.
7. ONE question only. No multiple questions.

${currentQ + 1 >= MAX_QUESTIONS ? `
IMPORTANT: This is the FINAL question. Make it count.
Pick the most challenging question that truly tests their ${level} ${role.name} skills.
After they answer this, you will evaluate the entire interview.
` : ""}`;
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
Analyze the FULL conversation carefully and return ONLY valid JSON with no extra text:
{
  "score": number between 0 and 100,
  "strengths": ["specific strength with example from interview", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement with context", "specific improvement 2", "specific improvement 3"],
  "decision": "Strong Hire" or "Hire" or "No Hire" or "Strong No Hire",
  "closing": "personalized 2-3 sentence closing message referencing specific things they did well or need to work on",
  "questionBreakdown": [
    {"question": "brief question description", "score": number 0-100, "comment": "specific 1 sentence comment on their answer"}
  ]
}

Scoring guide:
- 90-100: Exceptional, answered everything perfectly with depth
- 75-89: Strong candidate, minor gaps
- 60-74: Average, some good answers but notable gaps
- 40-59: Below expectations, significant gaps
- 0-39: Poor performance, fundamental misunderstandings

Be honest and accurate. The score should reflect real interview standards at ${company.name}.`;

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
        {/* Chat Panel */}
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
                  {"</>"}
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
              {isListening ? "🎙️ Listening..." : isSpeaking ? "🔊 Interviewer speaking — click Pause to interrupt" : "Enter to send • 🎙️ voice input • </> code editor"}
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