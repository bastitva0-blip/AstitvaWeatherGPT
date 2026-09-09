import { useState, useRef } from "react";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import type { ChatMessage } from "../../stores/chatStore";
import { FeedbackButtons } from "./FeedbackButtons";
import { fetchTTS } from "../../lib/api";
import { useLangStore } from "../../stores/langStore";

const ALERT_COLOR: Record<string, "error" | "warning" | "neutral"> = {
  warning: "error", watch: "warning", advisory: "neutral",
};

function TTSButton({ text }: { text: string }) {
  const { lang } = useLangStore();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function toggle() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    setLoading(true);
    try {
      const b64 = await fetchTTS(text.slice(0, 500), lang);
      if (!b64) return;
      const audio = new Audio(`data:audio/mp3;base64,${b64}`);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
    } catch (e) {
      console.error("TTS failed:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      title={playing ? "Stop" : "Listen"}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: playing ? "var(--teal)" : "var(--text-muted)",
        fontSize: "1rem", padding: "0 4px",
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? "⏳" : playing ? "⏹️" : "🔊"}
    </button>
  );
}

function ShareButton({ text, location }: { text: string; location: string }) {
  async function share() {
    const shareText = `🌤 Sanket Weather Update — ${location}\n\n${text}\n\nPowered by Sanket AI · sanket.in`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Weather — ${location}`, text: shareText });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(shareText);
    alert("Answer copied to clipboard!");
  }

  return (
    <button
      onClick={share}
      title="Share this answer"
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--text-muted)", fontSize: "1rem", padding: "0 4px",
      }}
    >
      📤
    </button>
  );
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const r = message.response;

  return (
    <div className={`chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--assistant"}`}>
      <p style={{ margin: 0 }}>{message.text}</p>

      {r && (
        <div style={{ marginTop: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <strong>{r.weather_summary.location}</strong>
            {r.weather_summary.condition && <span>{r.weather_summary.condition}</span>}
            {r.alert_level !== "none" && (
              <Badge color={ALERT_COLOR[r.alert_level] || "neutral"} variant="soft">
                {r.alert_level}
              </Badge>
            )}
          </div>

          {r.use_case_context === "fisherman" && r.weather_summary.fishing_zone_safe != null && (
            <Badge
              color={r.weather_summary.fishing_zone_safe ? "success" : "error"}
              variant="solid"
              style={{ marginTop: "0.4rem" }}
            >
              {r.weather_summary.fishing_zone_safe ? "SAFE to go to sea" : "UNSAFE, do not go to sea"}
            </Badge>
          )}

          <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
            {r.citations.map((c, i) => (
              <a key={i} href={c.url || "#"} target="_blank" rel="noreferrer">
                <Badge color="accent" variant="soft">[{c.source}]</Badge>
              </a>
            ))}
          </div>

          {r.llm_source && (
            <div className="llm-badge" style={{ marginTop: "0.3rem" }}>
              {r.llm_source === "qwen-local" && <span title="Running on our own server">Qwen 2.5 7B · Local</span>}
              {r.llm_source === "nvidia-nim" && <span title="NVIDIA cloud inference">NVIDIA NIM · Llama 3.2 11B</span>}
              {r.llm_source === "nvidia-nim-fallback" && <span title="Local unavailable, using cloud fallback">NVIDIA NIM · Fallback</span>}
              {r.llm_source === "deterministic" && <span title="No LLM available">Template</span>}
            </div>
          )}
        </div>
      )}

      {/* Action row: feedback + TTS + share */}
      {!isUser && r && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
          <FeedbackButtons messageId={message.id} responseText={message.text} feedback={message.feedback} />
          <TTSButton text={message.text} />
          <ShareButton text={message.text} location={r.weather_summary.location} />
        </div>
      )}
    </div>
  );
}
