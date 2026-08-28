import { useState } from "react";
import { ChatBubble } from "../components/ChatBubble";
import { LanguageSelect } from "../components/LanguageSelect";
import { VoiceButton } from "../components/VoiceButton";
import { useWebSocket } from "../hooks/useWebSocket";
import { sendQuery } from "../lib/api";
import { useAlertStore } from "../stores/alertStore";
import { useChatStore } from "../stores/chatStore";

export function ChatPage() {
  const { sessionId, messages, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "recording" | "processing">("idle");
  const alerts = useAlertStore((s) => s.alerts);
  useWebSocket(sessionId);

  async function submit(text: string, inputMode: "text" | "voice" = "text") {
    if (!text.trim()) return;
    addMessage({ id: crypto.randomUUID(), role: "user", text });
    setInput("");
    setThinking(true);
    try {
      const response = await sendQuery(text, sessionId, inputMode);
      addMessage({ id: crypto.randomUUID(), role: "assistant", text: response.answer, response });
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="chat-page">
      <header className="chat-page__header">
        <h1>WeatherGPT</h1>
        <LanguageSelect />
      </header>

      {alerts.length > 0 && (
        <div className="chat-page__alert-banner">{alerts[0].message}</div>
      )}

      <div className="chat-page__messages">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {voiceStatus === "recording" && <p className="chat-page__voice-status">🎤 Listening...</p>}
        {voiceStatus === "processing" && <p className="chat-page__voice-status">Processing your voice...</p>}
        {thinking && <p className="chat-page__thinking">Thinking...</p>}
      </div>

      <form
        className="chat-page__input-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about weather..."
          style={{ fontSize: 16 }}
        />
        <VoiceButton sessionId={sessionId} onLiveText={setInput} onStatusChange={setVoiceStatus} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
