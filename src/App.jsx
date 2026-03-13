import React, { useState } from "react";
import LandingScreen from "./components/LandingScreen";
import SetupScreen from "./components/SetupScreen";
import InterviewScreen from "./components/InterviewScreen";
import ResultsScreen from "./components/ResultScreen";

function App() {
  const [screen, setScreen] = useState("landing");
  const [config, setConfig] = useState(null);
  const [results, setResults] = useState(null);

  const handleStart = (cfg) => {
    setConfig(cfg);
    setScreen("interview");
  };

  const handleFinish = (res) => {
    setResults(res);
    setScreen("results");
  };

  const handleRetry = () => {
    setResults(null);
    setScreen("interview");
  };

  const handleReset = () => {
    setConfig(null);
    setResults(null);
    setScreen("landing");
  };

  return (
    <>
      {screen === "landing" && <LandingScreen onStart={() => setScreen("setup")} />}
      {screen === "setup" && <SetupScreen onStart={handleStart} onBack={() => setScreen("landing")} />}
      {screen === "interview" && config && (
        <InterviewScreen config={config} onFinish={handleFinish} onExit={handleReset} />
      )}
      {screen === "results" && results && (
        <ResultsScreen results={results} config={config} onRetry={handleRetry} onReset={handleReset} />
      )}
    </>
  );
}

export default App;