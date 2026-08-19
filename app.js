// BLAXE AI — Smart no-API assistant
// Created by Bashiru Fodlulahi

const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const webBtn = document.getElementById("webBtn");
const imageInput = document.getElementById("imageInput");
const attachment = document.getElementById("attachment");
const sidebar = document.getElementById("sidebar");

let messages = [];
let selectedImage = null;
let webSearch = false;
let lastTopic = "";
let lastOptions = [];

// -----------------------------
// UI
// -----------------------------

function scrollToBottom() {
  requestAnimationFrame(() => {
    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: "smooth"
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  });
}

function addMessage(role, text) {
  if (welcome) {
    welcome.style.display = "none";
  }

  const row = document.createElement("div");
  row.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "YOU" : "B";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  // Simple Markdown-style formatting
  bubble.innerHTML = formatText(text);

  row.appendChild(avatar);
  row.appendChild(bubble);
  chat.appendChild(row);

  scrollToBottom();
}

function formatText(text) {
  let safe = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/\n/g, "<br>");

  return safe;
}

function showTyping() {
  const old = document.getElementById("typing");
  if (old) old.remove();

  const row = document.createElement("div");
  row.className = "message assistant";
  row.id = "typing";

  row.innerHTML = `
    <div class="avatar">B</div>
    <div class="bubble">
      <span class="typing">BLAXE AI is thinking...</span>
    </div>
  `;

  chat.appendChild(row);
  scrollToBottom();
}

function removeTyping() {
  document.getElementById("typing")?.remove();
}

// -----------------------------
// Memory
// -----------------------------

function remember(role, content) {
  messages.push({
    role,
    content,
    time: Date.now()
  });

  // Keep the most recent conversation
  if (messages.length > 40) {
    messages = messages.slice(-40);
  }

  localStorage.setItem(
    "blaxe_conversation",
    JSON.stringify(messages)
  );
}

function loadMemory() {
  try {
    const saved = localStorage.getItem("blaxe_conversation");

    if (saved) {
      messages = JSON.parse(saved);

      messages.forEach(message => {
        if (message.role === "user" || message.role === "assistant") {
          addMessage(message.role, message.content);
        }
      });
    }
  } catch {
    messages = [];
  }
}

// -----------------------------
// Helpers
// -----------------------------

function clean(text) {
  return text
    .toLowerCase()
    .replace(/[?!.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function numberChoice(text) {
  const match = clean(text).match(/^(?:option\s*)?([1-9]|10)$/);
  return match ? Number(match[1]) : null;
}

function lastUserMessage() {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return messages[i].content;
    }
  }

  return "";
}

function previousUserMessage() {
  let foundCurrent = false;

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      if (foundCurrent) return messages[i].content;
      foundCurrent = true;
    }
  }

  return "";
}

function hasAny(text, words) {
  return words.some(word => text.includes(word));
}

// -----------------------------
// Business names
// -----------------------------

function businessNames() {
  const names = [
    "Veyora",
    "Blaxen",
    "Novexa",
    "Veltrix",
    "Lumora",
    "Zenvora",
    "Aurevia",
    "Nexora",
    "Vantora",
    "Elvexa"
  ];

  lastOptions = names;
  lastTopic = "business names";

  return `Absolutely. Here are 10 modern business names:

1. **Veyora**
2. **Blaxen**
3. **Novexa**
4. **Veltrix**
5. **Lumora**
6. **Zenvora**
7. **Aurevia**
8. **Nexora**
9. **Vantora**
10. **Elvexa**

Pick a number and I'll develop that name with you — including the meaning, slogan, brand identity and business concept.`;
}

// -----------------------------
// Business ideas
// -----------------------------

function businessIdeas() {
  const ideas = [
    "Premium graphic design studio",
    "Social media management agency",
    "Website creation service",
    "Digital products store",
    "AI productivity service",
    "Online tutoring platform",
    "Brand identity agency",
    "Video editing service",
    "Local business marketing agency",
    "Freelance technology service"
  ];

  lastOptions = ideas;
  lastTopic = "business ideas";

  return `Here are 10 business ideas:

1. **Premium graphic design studio**
2. **Social media management agency**
3. **Website creation service**
4. **Digital products store**
5. **AI productivity service**
6. **Online tutoring platform**
7. **Brand identity agency**
8. **Video editing service**
9. **Local business marketing agency**
10. **Freelance technology service**

Choose a number and I'll help you turn it into a real business.`;
}

// -----------------------------
// Handle option numbers
// -----------------------------

function handleChoice(number) {
  if (!lastOptions[number - 1]) {
    return `I don't have a numbered list available from the recent conversation.

Try asking me something like:
**"Give me 10 business names."**`;
  }

  const choice = lastOptions[number - 1];

  if (lastTopic === "business names") {
    return `Great choice: **${choice}**.

Here's how I would position it:

**Brand name:** ${choice}

**Brand personality:** Modern, premium and memorable.

**Possible slogan:** "Build Something Remarkable."

**Business direction:** ${choice} could work especially well for a technology, creative, consulting or digital-services brand.

If you want, say **"make it more luxurious"**, **"give me slogans"**, or **"create the brand identity."**`;
  }

  if (lastTopic === "business ideas") {
    return `Excellent choice: **${choice}**.

A simple starting plan:

**1. Choose a target customer**  
Decide exactly who you want to serve.

**2. Create your offer**  
Give customers one clear reason to choose you.

**3. Build your brand**  
Name, logo, colors and social presence.

**4. Find your first customers**  
Start with people and businesses around you.

**5. Improve from feedback**  
Use your first customers to make the service better.

If you want, I can create the **name, slogan, pricing and marketing plan** for this business.`;
  }

  return `You selected **${choice}**. Tell me what you'd like to do with it next.`;
}

// -----------------------------
// Writing
// -----------------------------

function writingResponse(text) {
  if (text.includes("caption")) {
    return `Here are 5 professional caption ideas:

**1.** Turning ideas into visuals that people remember.

**2.** Creativity isn't decoration — it's communication.

**3.** Your brand deserves more than ordinary.

**4.** Think bigger. Create better. Stand out.

**5.** Designed with purpose. Built to be remembered.

Tell me the business or topic and I'll make them specific to you.`;
  }

  if (text.includes("essay")) {
    return `I can help you create the essay.

Send me:
• The topic
• Required length
• Your school level
• Any instructions from your teacher

I'll structure it with an introduction, clear body paragraphs and a conclusion.`;
  }

  if (text.includes("letter")) {
    return `Sure. I can write the letter for you.

Tell me:
• Who the letter is for
• Why you're writing
• Formal or friendly tone
• Any important details

I'll turn it into a polished letter.`;
  }

  return `Absolutely. Tell me what you want me to write and I'll help you make it clear, professional and engaging.

You can ask for:
• Captions
• Essays
• Letters
• Business descriptions
• Advertisements
• Bios
• Social media posts
• Scripts`;
}

// -----------------------------
// Coding
// -----------------------------

function codingResponse(text) {
  if (text.includes("website") || text.includes("web")) {
    return `Yes — I can help you build a website.

A good structure is:

**1. Homepage** — introduce the product.

**2. Features** — explain what it does.

**3. About** — tell visitors who created it.

**4. Contact** — give users a way to reach you.

**5. Mobile design** — make it work beautifully on phones.

Tell me what type of website you want and I'll help you build it step by step.`;
  }

  return `💻 I can help you with coding.

Tell me:
• What you're building
• Which programming language you're using
• What isn't working

You can also paste your code and I'll explain what needs to change.`;
}

// -----------------------------
// Learning
// -----------------------------

function learningResponse(text) {
  return `📚 Let's learn it step by step.

I'll use this approach:

**Step 1 — Simple explanation**  
I'll explain the idea without complicated language.

**Step 2 — Example**  
I'll show you how it works in practice.

**Step 3 — Practice**  
I'll give you a small exercise.

**Step 4 — Check your understanding**  
You can answer and I'll help correct it.

Tell me the topic you want to learn.`;
}

// -----------------------------
// Math
// -----------------------------

function calculate(text) {
  const expression = text
    .replace(/what is/gi, "")
    .replace(/calculate/gi, "")
    .replace(/solve/gi, "")
    .replace(/=/g, "")
    .trim();

  if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
    return null;
  }

  try {
    // Basic arithmetic only
    const result = Function(
      `"use strict"; return (${expression})`
    )();

    if (Number.isFinite(result)) {
      return `The answer is **${result}**.`;
    }
  } catch {}

  return null;
}

// -----------------------------
// Main intelligence
// -----------------------------

function generateResponse(userText) {
  const text = clean(userText);

  // Number selection
  const choice = numberChoice(userText);

  if (choice) {
    return handleChoice(choice);
  }

  // Greetings
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)
  ) {
    return `Hello! 👋 I'm **BLAXE AI**.

I'm ready to help you with business, writing, coding, learning, brainstorming and planning.

What would you like to create today?`;
  }

  // Thanks
  if (hasAny(text, ["thank you", "thanks", "thank"])) {
    return `You're welcome! 😊

I'm ready for the next step whenever you are.`;
  }

  // Business name
  if (
    hasAny(text, [
      "business name",
      "company name",
      "brand name",
      "name for my business",
      "name my business"
    ])
  ) {
    return businessNames();
  }

  // Business ideas
  if (
    hasAny(text, [
      "business idea",
      "business ideas",
      "start a business",
      "business to start"
    ])
  ) {
    return businessIdeas();
  }

  // Make it more luxurious
  if (
    hasAny(text, [
      "more luxurious",
      "make it luxury",
      "make it premium",
      "more premium",
      "make it professional"
    ])
  ) {
    if (lastOptions.length > 0) {
      return `Absolutely. Let's make **${lastOptions[0]}** feel more premium.

**Luxury direction:**
• Elegant typography
• Minimal visual identity
• Strong brand symbol
• Sophisticated color palette
• Short memorable slogan

Possible slogan:

**"${lastOptions[0]} — Beyond Ordinary."**

If you tell me the industry, I'll create a complete luxury brand direction.`;
    }

    return `Absolutely. I can make it more luxurious.

Send me the name, design, caption or text you want upgraded.`;
  }

  // More / continue
  if (
    hasAny(text, [
      "give me more",
      "more ideas",
      "more names",
      "another one",
      "another",
      "continue"
    ])
  ) {
    if (lastTopic === "business names") {
      return businessNames();
    }

    if (lastTopic === "business ideas") {
      return businessIdeas();
    }

    return `Of course. Tell me what you'd like more of and I'll continue.`;
  }

  // Writing
  if (
    hasAny(text, [
      "write",
      "caption",
      "essay",
      "letter",
      "script",
      "post",
      "bio",
      "advertisement"
    ])
  ) {
    return writingResponse(text);
  }

  // Coding
  if (
    hasAny(text, [
      "code",
      "coding",
      "javascript",
      "html",
      "css",
      "python",
      "program",
      "website"
    ])
  ) {
    return codingResponse(text);
  }

  // Learning
  if (
    hasAny(text, [
      "teach me",
      "explain",
      "learn",
      "lesson",
      "what does",
      "how does"
    ])
  ) {
    return learningResponse(text);
  }

  // Simple math
  if (
    /[0-9]/.test(text) &&
    hasAny(text, ["calculate", "what is", "solve", "+", "-", "*", "/"])
  ) {
    const answer = calculate(userText);

    if (answer) return answer;
  }

  // Planning
  if (
    hasAny(text, [
      "plan",
      "strategy",
      "how do i start",
      "steps to",
      "roadmap"
    ])
  ) {
    return `Let's turn that into a plan.

**Step 1 — Define the goal**  
What exactly are you trying to achieve?

**Step 2 — Break it into tasks**  
Separate the big goal into small actions.

**Step 3 — Start with the easiest important task**  
Don't wait for everything to be perfect.

**Step 4 — Test and improve**  
See what works and change what doesn't.

**Step 5 — Keep building**  
Small progress every day becomes a finished project.

Tell me the exact goal and I'll create a detailed roadmap for you.`;
  }

  // Help
  if (text === "help" || text.includes("what can you do")) {
    return `I can help you with:

💼 **Business** — names, ideas, strategies and plans

✍️ **Writing** — captions, essays, letters, scripts and bios

💻 **Coding** — websites, programming and debugging

📚 **Learning** — simple explanations and study help

💡 **Brainstorming** — ideas for projects and content

🚀 **Planning** — roadmaps and step-by-step plans

🔢 **Math** — basic calculations

Try asking me something specific.`;
  }

  // Follow-up to previous conversation
  if (
    text.includes("make it") ||
    text.includes("change it") ||
    text.includes("improve it") ||
    text.includes("better")
  ) {
    const previous = previousUserMessage();

    return `Sure. 👍

I'll improve the idea from our previous conversation.

Previous request:
**${previous || "your last request"}**

Tell me what you want changed — for example:

• More professional
• More luxurious
• Shorter
• More creative
• More persuasive
• More modern`;
  }

  // General response
  return `I understand you.

You said:

**"${userText}"**

Tell me a little more about what you want to accomplish, and I'll help you work through it step by step.

You can also ask me for **business ideas, writing, coding, learning, planning or brainstorming**.`;
}

// -----------------------------
// Send message
// -----------------------------

async function sendMessage(text) {
  text = String(text || "").trim();

  if (!text) return;

  input.value = "";
  input.style.height = "auto";

  addMessage("user", text);
  remember("user", text);

  sendBtn.disabled = true;

  showTyping();

  // Small delay makes the interaction feel natural
  await new Promise(resolve => setTimeout(resolve, 650));

  const reply = generateResponse(text);

  removeTyping();

  addMessage("assistant", reply);
  remember("assistant", reply);

  sendBtn.disabled = false;

  input.focus();
  scrollToBottom();
}

// -----------------------------
// Form
// -----------------------------

if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(input.value);
  });
}

if (input) {
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height =
      Math.min(input.scrollHeight, 150) + "px";
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input.value);
    }
  });
}

// -----------------------------
// Prompt buttons
// -----------------------------

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt;

    input.value = prompt;
    input.focus();

    sendMessage(prompt);
  });
});

// -----------------------------
// Web button
// -----------------------------

if (webBtn) {
  webBtn.addEventListener("click", () => {
    webSearch = !webSearch;

    webBtn.classList.toggle(
      "active",
      webSearch
    );

    if (webSearch) {
      attachment.textContent =
        "🌐 Web mode selected";
    } else {
      attachment.textContent = "";
    }
  });
}

// -----------------------------
// Image attachment
// -----------------------------

if (imageInput) {
  imageInput.addEventListener("change", event => {
    const file = event.target.files?.[0];

    if (!file) return;

    selectedImage = file;

    if (attachment) {
      attachment.textContent =
        `📎 ${file.name} attached`;
    }
  });
}

// -----------------------------
// New chat
// -----------------------------

document.getElementById("newChat")?.addEventListener(
  "click",
  () => {

    messages = [];
    lastOptions = [];
    lastTopic = "";
    selectedImage = null;

    localStorage.removeItem(
      "blaxe_conversation"
    );

    chat.innerHTML = "";

    if (welcome) {
      chat.appendChild(welcome);
      welcome.style.display = "block";
    }

    if (attachment) {
      attachment.textContent = "";
    }

    input.focus();
  }
);

// -----------------------------
// Clear chat
// -----------------------------

document.getElementById("clearBtn")?.addEventListener(
  "click",
  () => {

    messages = [];
    lastOptions = [];
    lastTopic = "";

    localStorage.removeItem(
      "blaxe_conversation"
    );

    chat.innerHTML = "";

    if (welcome) {
      chat.appendChild(welcome);
      welcome.style.display = "block";
    }
  }
);

// -----------------------------
// Mobile menu
// -----------------------------

document.getElementById("menuBtn")?.addEventListener(
  "click",
  () => {
    sidebar?.classList.toggle("open");
  }
);

// -----------------------------
// Start
// -----------------------------

loadMemory();

console.log(
  "BLAXE AI initialized — Created by Bashiru Fodlulahi"
);
