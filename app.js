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

function scrollBottom(){ chat.scrollTo({top:chat.scrollHeight, behavior:"smooth"}); }

function addMessage(role, text){
  if(welcome) welcome.style.display="none";
  const row=document.createElement("div");
  row.className=`message ${role}`;
  const avatar=document.createElement("div");
  avatar.className="avatar";
  avatar.textContent=role==="user"?"YOU":"B";
  const bubble=document.createElement("div");
  bubble.className="bubble";
  bubble.textContent=text;
  row.append(avatar,bubble);
  chat.appendChild(row);
  scrollBottom();
  return bubble;
}

function setLoading(on){
  sendBtn.disabled=on;
  if(on){
    const row=document.createElement("div");
    row.className="message assistant"; row.id="typing";
    row.innerHTML='<div class="avatar">B</div><div class="bubble typing">BLAXE AI is thinking…</div>';
    chat.appendChild(row); scrollBottom();
  }else document.getElementById("typing")?.remove();
}

async function send(text){
  text=(text||input.value).trim();
  if(!text) return;
  input.value=""; input.style.height="auto";
  addMessage("user",text);
  messages.push({role:"user",content:text});
  setLoading(true);
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages,webSearch,imageData})});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"Request failed");
    setLoading(false);
    addMessage("assistant",data.text);
    messages.push({role:"assistant",content:data.text});
    imageData=null; attachment.textContent="";
  }catch(e){
    setLoading(false); addMessage("assistant","Sorry — "+e.message);
  }
}

form.addEventListener("submit",e=>{e.preventDefault();send();});
input.addEventListener("input",()=>{input.style.height="auto";input.style.height=Math.min(input.scrollHeight,140)+"px"});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}});

document.querySelectorAll("[data-prompt]").forEach(btn=>{
  btn.addEventListener("click",()=>{ input.value=btn.dataset.prompt; input.focus(); });
});

webBtn.addEventListener("click",()=>{webSearch=!webSearch;webBtn.classList.toggle("active",webSearch);});
imageInput.addEventListener("change",e=>{
  const file=e.target.files?.[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{imageData=reader.result;attachment.textContent=`📎 ${file.name} attached — ask BLAXE AI to analyze it.`;};
  reader.readAsDataURL(file);
});

document.getElementById("newChat").addEventListener("click",()=>{
  messages=[]; imageData=null; attachment.textContent=""; chat.innerHTML="";
  chat.appendChild(welcome); welcome.style.display="block"; sidebar.classList.remove("open");
});
document.getElementById("clearBtn").addEventListener("click",()=>{
  messages=[]; imageData=null; attachment.textContent=""; chat.innerHTML="";
  chat.appendChild(welcome); welcome.style.display="block";
});
document.getElementById("menuBtn").addEventListener("click",()=>sidebar.classList.toggle("open"));
