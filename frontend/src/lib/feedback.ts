const API_KEY = import.meta.env.VITE_API_KEY || "test-key";
const BASE = import.meta.env.VITE_API_BASE || "";

export interface FeedbackPayload {
  query_id: string;
  sentiment: "positive" | "negative";
  reason: string | null;
  response_text: string;
}

export async function postFeedback(payload: FeedbackPayload) {
  const res = await fetch(`${BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`feedback failed: ${res.status}`);
  return res.json();
}
