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
  bubble.textContent = text;

  row.append(avatar, bubble);
  chat.appendChild(row);

  scrollBottom();

  return bubble;
}

function setLoading(on) {
  sendBtn.disabled = on;

  if (on) {
    const row = document.createElement("div");

    row.className = "message assistant";
    row.id = "typing";

    row.innerHTML =
      '<div class="avatar">B</div>' +
      '<div class="bubble typing">BLAXE AI is thinking…</div>';

    chat.appendChild(row);

    scrollBottom();
  } else {
    document.getElementById("typing")?.remove();
  }
}

async function send(text) {
  text = (text || input.value).trim();

  if (!text) {
    return;
  }

  input.value = "";
  input.style.height = "auto";

  addMessage("user", text);

  messages.push({
    role: "user",
    content: text
  });

  setLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages,
        webSearch,
        imageData
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Request failed"
      );
    }

    setLoading(false);

    addMessage(
      "assistant",
      data.text
    );

    messages.push({
      role: "assistant",
      content: data.text
    });

    imageData = null;
    attachment.textContent = "";

  } catch (error) {
    setLoading(false);

    addMessage(
      "assistant",
      "Sorry — " + error.message
    );
  }
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
  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {
    event.preventDefault();
    send();
  }
});

document
  .querySelectorAll("[data-prompt]")
  .forEach(function(button) {

    button.addEventListener("click", function() {
      input.value = button.dataset.prompt;
      input.focus();
    });

  });

webBtn.addEventListener("click", function() {

  webSearch = !webSearch;

  webBtn.classList.toggle(
    "active",
    webSearch
  );

});

imageInput.addEventListener("change", function(event) {

  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function() {

    imageData = reader.result;

    attachment.textContent =
      `📎 ${file.name} attached — ask BLAXE AI to analyze it.`;

  };

  reader.readAsDataURL(file);

});

document
  .getElementById("newChat")
  .addEventListener("click", function() {

    messages = [];
    imageData = null;
    attachment.textContent = "";

    chat.innerHTML = "";

    chat.appendChild(welcome);

    welcome.style.display = "block";

    sidebar.classList.remove("open");

  });

document
  .getElementById("clearBtn")
  .addEventListener("click", function() {

    messages = [];
    imageData = null;
    attachment.textContent = "";

    chat.innerHTML = "";

    chat.appendChild(welcome);

    welcome.style.display = "block";

  });

document
  .getElementById("menuBtn")
  .addEventListener("click", function() {

    sidebar.classList.toggle("open");

  });
