const API_KEY = import.meta.env.VITE_API_KEY || "test-key";
const BASE = import.meta.env.VITE_API_BASE || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY, ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface QueryResponse {
  answer: string;
  citations: { source: string; detail: string; url: string }[];
  weather_summary: {
    location: string;
    date: string;
    rainfall_mm?: number;
    condition?: string;
    nwp_model?: string;
    wave_height_m?: number;
    fishing_zone_safe?: boolean | null;
    coastal_zone?: string | null;
  };
  alert_level: "none" | "advisory" | "watch" | "warning";
  use_case_context: string;
}

export function sendQuery(message: string, sessionId: string, inputMode: "text" | "voice" = "text") {
  return request<QueryResponse>("/api/query", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId, input_mode: inputMode }),
  });
}

export function fetchLiveWeather(location: string) {
  return request(`/api/weather/live?location=${encodeURIComponent(location)}`);
}

export function fetchClimateTrend(location: string, parameter = "rainfall") {
  return request(`/api/climate/trend?location=${encodeURIComponent(location)}&parameter=${parameter}`);
}

export function subscribeAlert(location: string, thresholdType: string, thresholdValue: number) {
  return request("/api/alert/subscribe", {
    method: "POST",
    body: JSON.stringify({
      user_api_key: API_KEY, location, threshold_type: thresholdType, threshold_value: thresholdValue,
    }),
  });
}

export async function transcribeVoice(blob: Blob, sessionId: string, hintLang?: string) {
  const form = new FormData();
  form.append("audio", blob, "recording.webm");
  form.append("session_id", sessionId);
  if (hintLang) form.append("hint_lang", hintLang);
  const res = await fetch(`${BASE}/api/nlp/voice`, {
    method: "POST", headers: { "X-API-Key": API_KEY }, body: form,
  });
  if (!res.ok) throw new Error(`voice transcribe failed: ${res.status}`);
  return res.json();
}
