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

export function sendQuery(message: string, sessionId: string, inputMode: "text" | "voice" = "text", locationHint?: string) {
  return request<QueryResponse>("/api/query", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId, input_mode: inputMode, location_hint: locationHint || undefined }),
  });
}

/** Matches the real GET /api/weather/live response shape (weather_service.fetch_weather). */
export interface WeatherData {
  location: string;
  date: string;
  condition: string;
  temperature_max: number;
  temperature_min: number;
  humidity_percent?: number;
  wind_speed_kmh?: number;
  wind_direction?: string;
  visibility_km?: number;
  rainfall_mm?: number;
  rainfall_probability?: number;
  wave_height_m?: number | null;
  coastal_zone?: string | null;
  nwp_model?: string | null;
  source: string;
  source_url: string;
  cyclone_warning?: boolean;
  cyclone_name?: string | null;
  flood_warning?: boolean;
  flood_name?: string | null;
  heatwave_warning?: boolean;
  nearby_disaster_alerts?: unknown[];
}
export function fetchLiveWeather(location: string) {
  return request<WeatherData>(`/api/weather/live?location=${encodeURIComponent(location)}`);
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

export interface AqiResponse {
  aqi_index: number;
  aqi_label: string;
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  source: string;
  source_url: string;
}
export function fetchAqi(location: string) {
  return request<AqiResponse>(`/api/aqi?location=${encodeURIComponent(location)}`);
}

export interface MetarResponse {
  icao_code: string;
  station_name: string;
  raw_metar: string;
  temperature_c: number;
  wind_direction_deg: number;
  wind_speed_kt: number;
  visibility_sm: number;
  qnh_hpa: number;
  flight_category: string;
  observed_at: string;
  source: string;
  source_url: string;
}
export function fetchMetar(icao: string) {
  return request<MetarResponse>(`/api/metar?icao=${encodeURIComponent(icao)}`);
}

export function fetchAgro(location: string, crop: string) {
  return request(`/api/agro?location=${encodeURIComponent(location)}&crop=${encodeURIComponent(crop)}`);
}

export interface AdminStats {
  total_queries: number;
  intent_distribution: Record<string, number>;
  top_locations: { location: string; count: number }[];
  recent_queries: { id: string; message: string; intent: string; location: string; lang: string; input_mode: string; created_at: string }[];
  hallucination_logs: { id: string; query_id: string; issue: string; created_at: string }[];
}
export function fetchAdminStats() {
  return request<AdminStats>("/api/admin/stats");
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
