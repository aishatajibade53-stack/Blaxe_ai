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
let webSearch = false;
let imageData = null;

function scrollBottom() {
  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: "smooth"
  });
}

function addMessage(role, text) {
  if (welcome) welcome.style.display = "none";

  const row = document.createElement("div");
  row.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "YOU" : "B";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.append(avatar, bubble);
  chat.appendChild(row);

  scrollBottom();
}

function demoAI(message) {
  const text = message.toLowerCase();

  if (/^(hi|hello|hey)\b/.test(text)) {
    return "Hello! 👋 I'm BLAXE AI. I'm ready to help you with ideas, writing, coding, learning and business.";
  }

  if (text.includes("who are you") || text.includes("what are you")) {
    return "I'm BLAXE AI — your personal AI assistant. 🤖 This version is running as a free demo on the web.";
  }

  if (text.includes("business")) {
    return `Here are 5 business ideas you can explore:

1. Graphic design services
2. Social media management
3. Website creation
4. Digital products
5. Online tutoring

Tell me which one interests you and I'll help you develop the idea.`;
  }

  if (text.includes("idea") || text.includes("ideas")) {
    return `💡 Let's brainstorm!

I can help with:
• Business ideas
• App ideas
• Website ideas
• Content ideas
• YouTube ideas
• Pinterest ideas
• School projects

Tell me the area you want ideas for.`;
  }

  if (text.includes("code") || text.includes("coding")) {
    return `💻 I can help you with coding.

Tell me:
• The programming language
• What you're trying to build
• The error or problem you're facing

I'll explain the solution step by step.`;
  }

  if (
    text.includes("write") ||
    text.includes("essay") ||
    text.includes("letter") ||
    text.includes("caption")
  ) {
    return `✍️ Absolutely.

Send me the text or tell me what you want written.

I can make it:
• Professional
• Catchy
• Persuasive
• Friendly
• Short
• Luxury/cinematic`;
  }

  if (
    text.includes("learn") ||
    text.includes("teach") ||
    text.includes("explain")
  ) {
    return `📚 Let's learn it together.

Tell me the topic and I'll explain it in simple steps with examples.`;
  }

  if (text.includes("help")) {
    return `I'm here to help. 🤖

Try asking me about:
• Business
• Coding
• Writing
• Learning
• Ideas
• Planning
• Projects

What would you like to work on?`;
  }

  return `I received your message:

"${message}"

I'm currently running in BLAXE AI's free demo mode. I can help with ideas, writing, coding, learning and business questions.

Try asking me something specific! 🚀`;
}

async function send(text) {
  text = (text || input.value).trim();

  if (!text) return;

  input.value = "";
  input.style.height = "auto";

  addMessage("user", text);

  messages.push({
    role: "user",
    content: text
  });

  sendBtn.disabled = true;

  const typing = document.createElement("div");
  typing.className = "message assistant";
  typing.id = "typing";

  typing.innerHTML =
    '<div class="avatar">B</div>' +
    '<div class="bubble typing">BLAXE AI is thinking…</div>';

  chat.appendChild(typing);
  scrollBottom();

  setTimeout(() => {
    document.getElementById("typing")?.remove();

    const reply = demoAI(text);

    addMessage("assistant", reply);

    messages.push({
      role: "assistant",
      content: reply
    });

    sendBtn.disabled = false;
  }, 700);
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  send();
});

input.addEventListener("input", function() {
  input.style.height = "auto";
  input.style.height =
    Math.min(input.scrollHeight, 140) + "px";
});

input.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", function() {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

webBtn.addEventListener("click", function() {
  webSearch = !webSearch;
  webBtn.classList.toggle("active", webSearch);
});

imageInput.addEventListener("change", function(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  imageData = file;

  attachment.textContent =
    `📎 ${file.name} attached`;
});

document.getElementById("newChat").addEventListener("click", function() {
  messages = [];
  imageData = null;
  attachment.textContent = "";

  chat.innerHTML = "";
  chat.appendChild(welcome);

  welcome.style.display = "block";
  sidebar.classList.remove("open");
});

document.getElementById("clearBtn").addEventListener("click", function() {
  messages = [];
  imageData = null;
  attachment.textContent = "";

  chat.innerHTML = "";
  chat.appendChild(welcome);

  welcome.style.display = "block";
});

document.getElementById("menuBtn").addEventListener("click", function() {
  sidebar.classList.toggle("open");
});
