export const callClaude = async (messages, systemPrompt) => {
  try {
    const response = await fetch("http://localhost:5001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, systemPrompt }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("API error:", data.error);
      return "Sorry, there was an error. Please try again.";
    }

    return data.text || "";
  } catch (err) {
    console.error("Network error:", err);
    return "Could not connect to server. Make sure the backend is running.";
  }
};