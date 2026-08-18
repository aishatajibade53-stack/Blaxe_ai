import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Add it to .env before using BLAXE AI.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "12mb" }));
app.use(express.static("public"));

const SYSTEM = `You are BLAXE AI, a capable, friendly, accurate general-purpose AI assistant.
Help with writing, coding, learning, brainstorming, business, mathematics, analysis, planning, research, and everyday questions.
Be concise when the user wants a direct answer and detailed when the task requires it.
Never claim to have performed an action you cannot perform.
When current information is needed and web search is enabled, use the web search tool.
When an image is supplied, analyze it carefully.
Use clean Markdown.`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], webSearch = false, imageData = null } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No message supplied." });
    }

    const safeMessages = messages.slice(-20).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 12000)
    }));

    const latest = safeMessages[safeMessages.length - 1];
    let input = safeMessages;

    if (imageData && latest?.role === "user") {
      input = [
        ...safeMessages.slice(0, -1),
        {
          role: "user",
          content: [
            { type: "input_text", text: latest.content || "Analyze this image." },
            { type: "input_image", image_url: imageData }
          ]
        }
      ];
    }

    const params = {
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      instructions: SYSTEM,
      input,
      store: false
    };

    if (webSearch) {
      params.tools = [{ type: "web_search" }];
    }

    const response = await client.responses.create(params);

    res.json({
      text: response.output_text || "I couldn't produce a response.",
      responseId: response.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error?.message || "Something went wrong while contacting the AI."
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "BLAXE AI" });
});

app.listen(port, () => {
  console.log(`BLAXE AI running at http://localhost:${port}`);
});