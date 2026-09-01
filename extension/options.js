const DEFAULTS = { apiBase: "http://localhost:8000", apiKey: "test-key" };

async function load() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  document.getElementById("apiBase").value = stored.apiBase || DEFAULTS.apiBase;
  document.getElementById("apiKey").value = stored.apiKey || DEFAULTS.apiKey;
}

document.getElementById("save").addEventListener("click", async () => {
  const apiBase = document.getElementById("apiBase").value.trim() || DEFAULTS.apiBase;
  const apiKey = document.getElementById("apiKey").value.trim() || DEFAULTS.apiKey;
  await chrome.storage.sync.set({ apiBase, apiKey });
  const status = document.getElementById("status");
  status.textContent = "Saved.";
  setTimeout(() => { status.textContent = ""; }, 1500);
});

load();
