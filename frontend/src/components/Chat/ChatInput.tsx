import { useState } from "react";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconArrowUp, IconPlus } from "@tabler/icons-react";
import { VoiceButton } from "../UI/VoiceButton";

const MAX_MESSAGE_LENGTH = 500;

export function ChatInput({
  sessionId, onSubmit, voiceStatus, onVoiceStatusChange,
}: {
  sessionId: string;
  onSubmit: (text: string) => void;
  voiceStatus: "idle" | "recording" | "processing";
  onVoiceStatusChange: (s: "idle" | "recording" | "processing") => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(t: string) {
    if (t.trim().length === 0) return;
    if (t.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long — max ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }
    setError(null);
    onSubmit(t.trim());
    setText("");
  }

  return (
    <div>
      {text.length > 400 && (
        <div style={{ textAlign: "right", fontSize: "0.75rem", color: text.length >= 500 ? "var(--danger)" : text.length >= 480 ? "var(--saffron)" : "var(--text-muted)" }}>
          {text.length} / {MAX_MESSAGE_LENGTH}
        </div>
      )}
      {error && <div style={{ color: "var(--danger)", fontSize: "0.8rem" }}>{error}</div>}
      <form
        className={`chat-input-bar ${voiceStatus === "recording" ? "chat-input-bar--recording" : ""}`}
        onSubmit={(e) => { e.preventDefault(); submit(text); }}
      >
        <IconButton icon={<IconPlus />} variant="ghost" aria-label="Attach" disabled />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about weather..."
          wrapperClassName="flex-1"
        />
        <VoiceButton
          sessionId={sessionId}
          onLiveText={setText}
          onStatusChange={onVoiceStatusChange}
          onSubmit={submit}
        />
        {text.trim() && (
          <IconButton icon={<IconArrowUp />} type="submit" variant="solid" shape="circle" aria-label="Send" />
        )}
      </form>
    </div>
  );
}
