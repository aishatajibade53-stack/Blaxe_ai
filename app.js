```javascript
// BLAXE AI
// Browser AI - No OpenAI API
// Created by Bashiru Fodlulahi

const MODEL = "onnx-community/Qwen2.5-0.5B-Instruct";

let generator = null;
let loading = false;
let messages = [];

const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");


// ----------------------------------------
// SCROLL
// ----------------------------------------

function scrollToBottom() {
  if (!chat) return;

  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      chat.scrollTop = chat.scrollHeight;
    }, 100);
  });
}


// ----------------------------------------
// TEXT FORMAT
// ----------------------------------------

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


function formatText(text) {
  return escapeHTML(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}


// ----------------------------------------
// ADD MESSAGE
// ----------------------------------------

function addMessage(role, text) {

  if (!chat) return;

  if (welcome) {
    welcome.style.display = "none";
  }

  const row = document.createElement("div");

  row.className =
    role === "user"
      ? "message user"
      : "message assistant";


  const avatar =
    document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    role === "user"
      ? "YOU"
      : "B";


  const bubble =
    document.createElement("div");

  bubble.className = "bubble";

  bubble.innerHTML =
    formatText(text);


  row.appendChild(avatar);
  row.appendChild(bubble);

  chat.appendChild(row);

  scrollToBottom();
}


// ----------------------------------------
// TYPING
// ----------------------------------------

function showTyping() {

  removeTyping();

  const row =
    document.createElement("div");

  row.id = "blaxe-typing";

  row.className =
    "message assistant";


  row.innerHTML = `
    <div class="avatar">B</div>

    <div class="bubble">
      <span class="typing">
        BLAXE AI is thinking...
      </span>
    </div>
  `;


  chat.appendChild(row);

  scrollToBottom();
}


function removeTyping() {

  const item =
    document.getElementById(
      "blaxe-typing"
    );

  if (item) {
    item.remove();
  }
}


// ----------------------------------------
// LOAD MODEL
// ----------------------------------------

async function loadModel() {

  if (generator) {
    return generator;
  }


  if (loading) {

    while (loading) {

      await new Promise(
        resolve =>
          setTimeout(resolve, 300)
      );

    }

    return generator;
  }


  if (
    typeof window.BLAXE_AI_PIPELINE !==
    "function"
  ) {

    throw new Error(
      "Transformers.js has not loaded. Refresh the page and try again."
    );

  }


  loading = true;


  try {

    addMessage(
      "assistant",
      "⏳ BLAXE AI is starting for the first time. Please wait while the AI model loads on your device."
    );


    let device = "wasm";

    if (
      navigator.gpu
    ) {
      device = "webgpu";
    }


    generator =
      await window.BLAXE_AI_PIPELINE(
        "text-generation",
        MODEL,
        {
          dtype: "q4",
          device: device
        }
      );


    addMessage(
      "assistant",
      "✅ BLAXE AI is ready. Ask me anything."
    );


    return generator;


  } catch (error) {

    console.error(
      "Model loading error:",
      error
    );

    generator = null;

    throw error;


  } finally {

    loading = false;

  }
}


// ----------------------------------------
// CONVERSATION
// ----------------------------------------

function buildConversation() {

  return [

    {
      role: "system",

      content:
        `You are BLAXE AI, a helpful AI assistant created by Bashiru Fodlulahi.

Answer the user's actual question.

You can help with:
business, writing, coding, learning, mathematics, ideas, planning, technology and everyday questions.

Be friendly and useful.

Never say that you are a demo.

Never tell the user that you cannot answer simply because you are a demo.

Give the best answer you can.`
    },

    ...messages.slice(-10)

  ];
}


// ----------------------------------------
// GENERATE RESPONSE
// ----------------------------------------

async function generateResponse() {

  const pipe =
    await loadModel();


  const conversation =
    buildConversation();


  const result =
    await pipe(
      conversation,
      {
        max_new_tokens: 256,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      }
    );


  if (
    !result ||
    !result.length
  ) {

    throw new Error(
      "The AI returned an empty response."
    );

  }


  const generated =
    result[0].generated_text;


  let answer = "";


  if (
    Array.isArray(generated)
  ) {

    const last =
      generated[
        generated.length - 1
      ];

    answer =
      last?.content || "";

  } else {

    answer =
      String(generated || "");

  }


  answer =
    answer.trim();


  if (!answer) {

    throw new Error(
      "The AI generated an empty response."
    );

  }


  return answer;
}


// ----------------------------------------
// SEND
// ----------------------------------------

async function sendMessage(text) {

  text =
    String(text || "").trim();


  if (!text) {
    return;
  }


  if (sendBtn) {
    sendBtn.disabled = true;
  }


  input.value = "";

  input.style.height =
    "auto";


  addMessage(
    "user",
    text
  );


  messages.push({
    role: "user",
    content: text
  });


  saveMessages();


  showTyping();


  try {

    const answer =
      await generateResponse();


    removeTyping();


    addMessage(
      "assistant",
      answer
    );


    messages.push({
      role: "assistant",
      content: answer
    });


    saveMessages();


  } catch (error) {

    console.error(
      "BLAXE AI ERROR:",
      error
    );


    removeTyping();


    addMessage(
      "assistant",
      "⚠️ BLAXE AI could not generate a response yet. The browser AI model may still be downloading or your device may not support the selected AI engine. Please wait a little, refresh the page, and try again."
    );

  }


  if (sendBtn) {
    sendBtn.disabled = false;
  }


  input.focus();

  scrollToBottom();
}


// ----------------------------------------
// SAVE
// ----------------------------------------

function saveMessages() {

  try {

    localStorage.setItem(
      "blaxe_messages",
      JSON.stringify(messages)
    );

  } catch (error) {

    console.warn(
      "Could not save chat:",
      error
    );

  }
}


// ----------------------------------------
// LOAD SAVED CHAT
// ----------------------------------------

function loadMessages() {

  try {

    const saved =
      localStorage.getItem(
        "blaxe_messages"
      );


    if (!saved) {
      return;
    }


    const parsed =
      JSON.parse(saved);


    if (!Array.isArray(parsed)) {
      return;
    }


    messages = parsed;


    messages.forEach(
      message => {

        if (
          message.role === "user" ||
          message.role === "assistant"
        ) {

          addMessage(
            message.role,
            message.content
          );

        }

      }
    );


    scrollToBottom();


  } catch (error) {

    console.warn(
      "Could not restore chat:",
      error
    );

    messages = [];

  }
}


// ----------------------------------------
// FORM
// ----------------------------------------

if (form) {

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      sendMessage(
        input.value
      );

    }
  );

}


// ----------------------------------------
// ENTER
// ----------------------------------------

if (input) {

  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage(
          input.value
        );

      }

    }
  );


  input.addEventListener(
    "input",
    () => {

      input.style.height =
        "auto";

      input.style.height =
        Math.min(
          input.scrollHeight,
          150
        ) + "px";

    }
  );

}


// ----------------------------------------
// PROMPT BUTTONS
// ----------------------------------------

document
  .querySelectorAll(
    "[data-prompt]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const prompt =
          button.dataset.prompt;

        input.value =
          prompt;

        sendMessage(
          prompt
        );

      }
    );

  });


// ----------------------------------------
// NEW CHAT
// ----------------------------------------

document
  .getElementById("newChat")
  ?.addEventListener(
    "click",
    () => {

      messages = [];

      localStorage.removeItem(
        "blaxe_messages"
      );


      chat.innerHTML = "";


      if (welcome) {

        chat.appendChild(
          welcome
        );

        welcome.style.display =
          "block";

      }


      scrollToBottom();

      input.focus();

    }
  );


// ----------------------------------------
// CLEAR CHAT
// ----------------------------------------

document
  .getElementById("clearBtn")
  ?.addEventListener(
    "click",
    () => {

      messages = [];

      localStorage.removeItem(
        "blaxe_messages"
      );


      chat.innerHTML = "";


      if (welcome) {

        chat.appendChild(
          welcome
        );

        welcome.style.display =
          "block";

      }

    }
  );


// ----------------------------------------
// MOBILE MENU
// ----------------------------------------

document
  .getElementById("menuBtn")
  ?.addEventListener(
    "click",
    () => {

      document
        .getElementById("sidebar")
        ?.classList.toggle(
          "open"
        );

    }
  );


// ----------------------------------------
// START
// ----------------------------------------

loadMessages();

console.log(
  "BLAXE AI loaded."
);

console.log(
  "Browser model:",
  MODEL
);
```
