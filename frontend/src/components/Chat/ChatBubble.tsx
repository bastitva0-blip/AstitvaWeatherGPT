import { Badge } from "@devalok/shilp-sutra/ui/badge";
import type { ChatMessage } from "../../stores/chatStore";
import { FeedbackButtons } from "./FeedbackButtons";

const ALERT_COLOR: Record<string, "error" | "warning" | "neutral"> = { warning: "error", watch: "warning", advisory: "neutral" };

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
            {r.alert_level !== "none" && <Badge color={ALERT_COLOR[r.alert_level] || "neutral"} variant="soft">{r.alert_level}</Badge>}
          </div>
          {r.use_case_context === "fisherman" && r.weather_summary.fishing_zone_safe != null && (
            <Badge color={r.weather_summary.fishing_zone_safe ? "success" : "error"} variant="solid" style={{ marginTop: "0.4rem" }}>
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
        </div>
      )}
      {!isUser && r && (
        <FeedbackButtons messageId={message.id} responseText={message.text} feedback={message.feedback} />
      )}
    </div>
  );
}
