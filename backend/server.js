const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get("/", (req, res) => {
  res.json({ status: "InterviewForge Backend Running!" });
});

app.post("/api/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  console.log(" Request received");
  console.log(" Groq API Key:", process.env.GROQ_API_KEY ? "YES" : "NO");

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Missing Groq API key in .env" });
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content || "";
    console.log(" Success! Response length:", text.length);
    res.json({ text });

  } catch (err) {
    console.error(" Server Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => {
  console.log(" InterviewForge backend running on http://localhost:5001");
});