// BLAXE AI
// Browser AI — No OpenAI API
// Created by Bashiru Fodlulahi

let generator = null;
let loadingModel = false;
let messages = [];

const MODEL = "Mozilla/Qwen2.5-0.5B-Instruct";

const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const attachment = document.getElementById("attachment");


// ------------------------------------
// BASIC HELPERS
// ------------------------------------

function scrollToBottom() {
  requestAnimationFrame(() => {
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
    }

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  });
}


function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


function formatText(text) {
  let output = escapeHTML(text);

  output = output.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  output = output.replace(
    /\n/g,
    "<br>"
  );

  return output;
}


// ------------------------------------
// DISPLAY MESSAGES
// ------------------------------------

function addMessage(role, text) {

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
}


// ------------------------------------
// TYPING INDICATOR
// ------------------------------------

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

  const typing =
    document.getElementById(
      "blaxe-typing"
    );

  if (typing) {
    typing.remove();
  }
}


// ------------------------------------
// LOAD AI MODEL
// ------------------------------------

async function loadModel() {

  if (generator) {
    return generator;
  }

  if (loadingModel) {

    while (loadingModel) {
      await new Promise(
        resolve =>
          setTimeout(resolve, 300)
      );
    }

    return generator;
  }


  if (!window.BLAXE_AI_PIPELINE) {

    throw new Error(
      "The browser AI engine has not loaded yet."
    );
  }


  loadingModel = true;


  addMessage(
    "assistant",
    "I'm preparing BLAXE AI on this device. The first startup may take a while because the AI model needs to download."
  );


  try {

    let device = "wasm";

    if (
      "gpu" in navigator
    ) {
      device = "webgpu";
    }


    generator =
      await window.BLAXE_AI_PIPELINE(
        "text-generation",
        MODEL,
        {
          device: device,
          dtype: "q4"
        }
      );


    removeTyping();

    addMessage(
      "assistant",
      "✅ BLAXE AI is ready. You can start asking questions."
    );


    return generator;

  } catch (error) {

    console.error(
      "BLAXE AI model error:",
      error
    );


    generator = null;

    throw error;

  } finally {

    loadingModel = false;

  }
}


// ------------------------------------
// BUILD CONVERSATION
// ------------------------------------

function buildMessages() {

  const systemMessage = {
    role: "system",
    content:
      `You are BLAXE AI, a helpful personal AI assistant created by Bashiru Fodlulahi.

Be friendly, accurate and useful.

Help with:
- business
- writing
- coding
- mathematics
- learning
- brainstorming
- planning
- technology
- everyday questions

Answer the user's actual question.

Do not say that you are a demo.

Do not claim that you are ChatGPT.

Keep answers reasonably concise unless the user asks for detail.`
  };


  const recent =
    messages.slice(-12);


  return [
    systemMessage,
    ...recent.map(message => ({
      role: message.role,
      content: message.content
    }))
  ];
}


// ------------------------------------
// GENERATE AI RESPONSE
// ------------------------------------

async function generateAIResponse() {

  const pipe =
    await loadModel();


  const conversation =
    buildMessages();


  const result =
    await pipe(
      conversation,
      {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true
      }
    );


  let generated = "";


  if (
    Array.isArray(result) &&
    result.length > 0
  ) {

    const item = result[0];


    if (
      Array.isArray(item.generated_text)
    ) {

      const last =
        item.generated_text[
          item.generated_text.length - 1
        ];

      generated =
        last?.content || "";

    } else {

      generated =
        item.generated_text || "";

    }

  }


  if (!generated) {

    generated =
      "I couldn't generate a response. Please try again.";

  }


  return String(generated).trim();
}


// ------------------------------------
// SEND MESSAGE
// ------------------------------------

async function sendMessage(text) {

  text =
    String(text || "").trim();


  if (!text) {
    return;
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


  if (messages.length > 20) {
    messages =
      messages.slice(-20);
  }


  localStorage.setItem(
    "blaxe_messages",
    JSON.stringify(messages)
  );


  sendBtn.disabled = true;


  showTyping();


  try {

    const answer =
      await generateAIResponse();


    removeTyping();


    addMessage(
      "assistant",
      answer
    );


    messages.push({
      role: "assistant",
      content: answer
    });


    localStorage.setItem(
      "blaxe_messages",
      JSON.stringify(messages)
    );


  } catch (error) {

    console.error(error);


    removeTyping();


    addMessage(
      "assistant",
      `I couldn't start the browser AI model yet.

Please refresh the page and try again.

If this is your first time using BLAXE AI, make sure you have a good internet connection because the model needs to download to your device.`
    );

  }


  sendBtn.disabled = false;

  input.focus();

  scrollToBottom();
}


// ------------------------------------
// FORM
// ------------------------------------

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


// ------------------------------------
// ENTER TO SEND
// ------------------------------------

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


// ------------------------------------
// PROMPT BUTTONS
// ------------------------------------

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


// ------------------------------------
// NEW CHAT
// ------------------------------------

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


      input.focus();

    }
  );


// ------------------------------------
// CLEAR CHAT
// ------------------------------------

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


// ------------------------------------
// MOBILE MENU
// ------------------------------------

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


// ------------------------------------
// RESTORE MEMORY
// ------------------------------------

try {

  const saved =
    localStorage.getItem(
      "blaxe_messages"
    );


  if (saved) {

    messages =
      JSON.parse(saved);


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

  }

} catch (error) {

  messages = [];

}


// ------------------------------------
// STARTUP
// ------------------------------------

console.log(
  "BLAXE AI browser engine initialized."
);

console.log(
  "Model:",
  MODEL
);
