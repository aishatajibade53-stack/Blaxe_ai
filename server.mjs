import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

function generateReply(message) {
  const text = message.toLowerCase();

  if (text.includes("hello") || text.includes("hi")) {
    return "Hello! 👋 I'm BLAXE AI. I'm ready to help you with ideas, writing, coding, learning, business and more.";
  }

  if (
    text.includes("business") ||
    text.includes("business idea")
  ) {
    return `Here are 5 business ideas you can explore:

1. Graphic design services
2. Social media management
3. Website creation
4. Digital products
5. Online tutoring

Tell me your budget, skills and location and I can help you choose one and create a plan.`;
  }

  if (
    text.includes("code") ||
    text.includes("coding") ||
    text.includes("program")
  ) {
    return `Absolutely. 💻

I can help you understand programming step by step.

Tell me:
• What language you're using
• What you're trying to build
• The problem you're experiencing

Then I'll help you work through it.`;
  }

  if (
    text.includes("write") ||
    text.includes("essay") ||
    text.includes("letter") ||
    text.includes("caption")
  ) {
    return `Absolutely. ✍️

Send me what you want to write and tell me the style you want, such as:

• Professional
• Friendly
• Persuasive
• Short and catchy
• Luxury
• Social-media style

I'll help you structure it.`;
  }

  if (
    text.includes("learn") ||
    text.includes("teach") ||
    text.includes("explain")
  ) {
    return `Let's learn it step by step. 📚

I'll explain the topic simply, give you examples, and then you can ask follow-up questions.

What would you like me to teach you?`;
  }

  if (
    text.includes("idea") ||
    text.includes("ideas")
  ) {
    return `Let's brainstorm. 💡

I can help you generate ideas for:
• Businesses
• Apps
• Websites
• Content
• Pinterest
• YouTube
• School projects
• Creative designs

Tell me what you're interested in and I'll generate ideas.`;
  }

  return `I'm BLAXE AI. 🤖

I received your message:

"${message}"

I'm currently running in free demo mode. I can help you brainstorm ideas, plan projects, improve writing, learn concepts and work through coding problems.

Ask me something specific and let's build together.`;
}

app.post("/api/chat", (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    const lastMessage =
      messages[messages.length - 1];

    const userMessage =
      lastMessage?.content || "";

    if (!userMessage.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const reply = generateReply(userMessage);

    res.json({
      text: reply
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "BLAXE AI encountered an error."
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    name: "BLAXE AI"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BLAXE AI running on port ${PORT}`);
});
