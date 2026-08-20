```javascript
// ============================================================
// BLAXE AI
// Browser AI - No paid API
// Created by Bashiru Fodlulahi
// ============================================================

const MODEL = "onnx-community/SmolLM-135M-Instruct-ONNX";
const APP_VERSION = "blaxe-local-ai-v4";

let ai = null;
let loading = false;
let messages = [];

const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");


// ============================================================
// SCROLLING
// ============================================================

function scrollToBottom() {
  if (!chat) return;

  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      chat.scrollTop = chat.scrollHeight;
    }, 150);
  });
}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}


function formatText(text) {
  return escapeHTML(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}


// ============================================================
// DISPLAY MESSAGE
// ============================================================

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


  const avatar = document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    role === "user"
      ? "YOU"
      : "B";


  const bubble = document.createElement("div");

  bubble.className = "bubble";

  bubble.innerHTML =
    formatText(text);


  row.appendChild(avatar);
  row.appendChild(bubble);

  chat.appendChild(row);

  scrollToBottom();

  return bubble;
}


// ============================================================
// TYPING MESSAGE
// ============================================================

function showThinking(text = "BLAXE AI is preparing...") {
  removeThinking();

  const row = document.createElement("div");

  row.id = "blaxe-thinking";

  row.className = "message assistant";


  row.innerHTML = `
    <div class="avatar">B</div>

    <div class="bubble">
      <span class="typing">${escapeHTML(text)}</span>
    </div>
  `;


  chat.appendChild(row);

  scrollToBottom();
}


function updateThinking(text) {
  const item =
    document.getElementById("blaxe-thinking");

  if (!item) return;

  const span =
    item.querySelector(".typing");

  if (span) {
    span.textContent = text;
  }

  scrollToBottom();
}


function removeThinking() {
  const item =
    document.getElementById("blaxe-thinking");

  if (item) {
    item.remove();
  }
}


// ============================================================
// LOAD TRANSFORMERS.JS DIRECTLY FROM app.js
// This avoids the previous script-loading race.
// ============================================================

async function getPipeline() {

  if (window.BLAXE_AI_PIPELINE) {
    return window.BLAXE_AI_PIPELINE;
  }


  updateThinking(
    "Loading BLAXE AI engine..."
  );


  try {

    const module =
      await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1"
      );


    window.BLAXE_AI_PIPELINE =
      module.pipeline;


    return module.pipeline;


  } catch (error) {

    console.error(
      "Transformers.js failed:",
      error
    );

    throw new Error(
      "BLAXE AI could not load its browser AI engine."
    );

  }
}


// ============================================================
// LOAD MODEL
// ============================================================

async function loadAI() {

  if (ai) {
    return ai;
  }


  if (loading) {

    while (loading) {

      await new Promise(
        resolve =>
          setTimeout(resolve, 300)
      );

    }

    return ai;
  }


  loading = true;


  try {

    const pipeline =
      await getPipeline();


    updateThinking(
      "Downloading BLAXE AI model... first setup only."
    );


    /*
      Use WebGPU when the browser exposes it.
      Otherwise use WASM.
    */

    let device = "wasm";
    let dtype = "q4";


    if (
      "gpu" in navigator
    ) {

      device = "webgpu";

      dtype = "q4f16";

    }


    console.log(
      "BLAXE AI device:",
      device
    );


    console.log(
      "BLAXE AI model:",
      MODEL
    );


    ai =
      await pipeline(
        "text-generation",
        MODEL,
        {
          device,
          dtype,

          progress_callback: progress => {

            if (
              progress &&
              typeof progress.progress === "number"
            ) {

              const percent =
                Math.round(
                  progress.progress
                );


              updateThinking(
                `Preparing BLAXE AI... ${percent}%`
              );

            } else {

              updateThinking(
                "Preparing BLAXE AI on this device..."
              );

            }

          }
        }
      );


    removeThinking();


    addMessage(
      "assistant",
      "✅ BLAXE AI is ready. Ask me anything."
    );


    return ai;


  } catch (error) {

    console.error(
      "BLAXE AI model error:",
      error
    );


    ai = null;


    removeThinking();


    addMessage(
      "assistant",
      "⚠️ I couldn't start the local AI model. Please check your internet connection and try once more. If your phone cannot run this browser model, I'll give you another solution rather than making you keep downloading it."
    );


    throw error;


  } finally {

    loading = false;

  }
}


// ============================================================
// CONVERSATION
// ============================================================

function getConversation() {

  return [

    {
      role: "system",

      content:
        `You are BLAXE AI, a helpful personal AI assistant created by Bashiru Fodlulahi.

Be friendly, clear and useful.

Help the user with business, writing, coding, learning, mathematics, ideas, planning and everyday questions.

Answer the user's actual question.

Do not call yourself a demo.

Do not repeatedly explain that you are a small model.

If the user asks a simple question, answer directly.

If the user asks for ideas, give useful ideas.

If the user asks for a business name, actually give business names.

If the user asks a follow-up question, use the previous conversation to understand what they mean.`
    },

    ...messages.slice(-8)

  ];
}


// ============================================================
// GENERATE ANSWER
// ============================================================

async function generateAnswer() {

  const generator =
    await loadAI();


  const conversation =
    getConversation();


  updateThinking(
    "BLAXE AI is thinking..."
  );


  const result =
    await generator(
      conversation,
      {
        max_new_tokens: 220,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.05,
        do_sample: true
      }
    );


  if (
    !result ||
    !result.length
  ) {

    throw new Error(
      "Empty AI result."
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
      "The AI returned an empty answer."
    );

  }


  return answer;
}


// ============================================================
// SAVE CHAT
// ============================================================

function saveChat() {

  try {

    localStorage.setItem(
      "blaxe_messages",
      JSON.stringify(messages)
    );

  } catch (error) {

    console.warn(
      "Could not save chat.",
      error
    );

  }
}


// ============================================================
// RESTORE CHAT
// ============================================================

function restoreChat() {

  try {

    const version =
      localStorage.getItem(
        "blaxe_app_version"
      );


    /*
      When we change the app version,
      remove the old broken conversation.
    */

    if (
      version !== APP_VERSION
    ) {

      localStorage.removeItem(
        "blaxe_messages"
      );

      localStorage.setItem(
        "blaxe_app_version",
        APP_VERSION
      );

      return;

    }


    const saved =
      localStorage.getItem(
        "blaxe_messages"
      );


    if (!saved) {
      return;
    }


    const oldMessages =
      JSON.parse(saved);


    if (
      !Array.isArray(oldMessages)
    ) {

      return;

    }


    messages =
      oldMessages.slice(-20);


    messages.forEach(
      message => {

        if (
          message &&
          (
            message.role === "user" ||
            message.role === "assistant"
          )
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
      "Could not restore conversation.",
      error
    );

    messages = [];

  }
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(text) {

  text =
    String(text || "").trim();


  if (!text) {
    return;
  }


  if (sendBtn) {
    sendBtn.disabled = true;
  }


  if (input) {

    input.value = "";

    input.style.height =
      "auto";

  }


  addMessage(
    "user",
    text
  );


  messages.push({
    role: "user",
    content: text
  });


  saveChat();


  showThinking(
    "BLAXE AI is preparing..."
  );


  try {

    const answer =
      await generateAnswer();


    removeThinking();


    addMessage(
      "assistant",
      answer
    );


    messages.push({
      role: "assistant",
      content: answer
    });


    saveChat();


  } catch (error) {

    console.error(
      "BLAXE AI:",
      error
    );


    removeThinking();


    addMessage(
      "assistant",
      "I couldn't complete that response. Please try again."
    );

  }


  if (sendBtn) {
    sendBtn.disabled = false;
  }


  if (input) {
    input.focus();
  }


  scrollToBottom();
}


// ============================================================
// FORM
// ============================================================

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


// ============================================================
// ENTER TO SEND
// ============================================================

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


// ============================================================
// PROMPT CARDS
// ============================================================

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

        sendMessage(
          prompt
        );

      }
    );

  });


// ============================================================
// NEW CHAT
// ============================================================

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

    }
  );


// ============================================================
// CLEAR CHAT
// ============================================================

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


      scrollToBottom();

    }
  );


// ============================================================
// MOBILE MENU
// ============================================================

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


// ============================================================
// START
// ============================================================

restoreChat();


console.log(
  "BLAXE AI started."
);

console.log(
  "Model:",
  MODEL
);
```
