const DEFAULTS = { apiBase: "https://backend-production-c6aa1.up.railway.app", apiKey: "test-key" };

const QUICK_ACTIONS = [
  { label: "Weather Check", query: "Will it rain in my city today?" },
  { label: "ATC Check", query: "VIDP airport weather" },
  { label: "Fisherman Check", query: "Is it safe to fish on the coast?" },
  { label: "Farmer Advisory", query: "Wheat crop advisory Ludhiana" },
  { label: "Disaster Alert", query: "Cyclone warnings active?" },
];

function getSessionId() {
  let id = sessionStorage.getItem("weathergpt_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("weathergpt_session_id", id);
  }
  return id;
}

function renderQuickActions() {
  const container = document.getElementById("quick-actions");
  container.innerHTML = "";
  for (const a of QUICK_ACTIONS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = a.label;
    btn.addEventListener("click", () => submitMessage(a.query));
    container.appendChild(btn);
  }
}

function hideQuickActions() {
  const container = document.getElementById("quick-actions");
  container.style.display = "none";
}

function addMessage(text, cls) {
  const messages = document.getElementById("messages");
  const el = document.createElement("div");
  el.className = `msg ${cls}`;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

function setThinking(on) {
  let el = document.getElementById("thinking");
  if (on) {
    if (!el) {
      el = document.createElement("div");
      el.id = "thinking";
      el.className = "thinking";
      el.textContent = "Thinking...";
      document.getElementById("messages").appendChild(el);
    }
  } else if (el) {
    el.remove();
  }
  const messages = document.getElementById("messages");
  messages.scrollTop = messages.scrollHeight;
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  return { apiBase: stored.apiBase || DEFAULTS.apiBase, apiKey: stored.apiKey || DEFAULTS.apiKey };
}

async function sendMessage(text) {
  const { apiBase, apiKey } = await loadSettings();
  const res = await fetch(`${apiBase}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({
      message: text,
      session_id: getSessionId(),
      input_mode: "text",
      detail_level: "short",
    }),
  });
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json();
}

async function submitMessage(text) {
  const input = document.getElementById("chat-text");
  const sendBtn = document.getElementById("chat-send");
  text = text.trim();
  if (!text) return;

  hideQuickActions();
  addMessage(text, "user");
  input.value = "";
  sendBtn.disabled = true;
  setThinking(true);
  try {
    const data = await sendMessage(text);
    setThinking(false);
    addMessage(data.answer, "bot");
  } catch (err) {
    setThinking(false);
    addMessage(`Could not reach WeatherGPT (${err.message}). Check Settings for the API URL.`, "error");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  submitMessage(document.getElementById("chat-text").value);
});

renderQuickActions();
