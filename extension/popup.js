const DEFAULTS = { apiBase: "http://localhost:8000", apiKey: "test-key" };

function getSessionId() {
  let id = sessionStorage.getItem("weathergpt_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("weathergpt_session_id", id);
  }
  return id;
}

function addMessage(text, cls) {
  const messages = document.getElementById("messages");
  const el = document.createElement("div");
  el.className = `msg ${cls}`;
  el.textContent = text;
  messages.appendChild(el);
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

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("chat-text");
  const sendBtn = document.getElementById("chat-send");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  sendBtn.disabled = true;
  try {
    const data = await sendMessage(text);
    addMessage(data.answer, "bot");
  } catch (err) {
    addMessage(`Error: could not reach WeatherGPT (${err.message}). Check Settings for the API URL.`, "msg error");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});
