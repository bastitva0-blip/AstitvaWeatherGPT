import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "../components/Chat/ChatBubble";
import { ChatInput } from "../components/Chat/ChatInput";
import { SuggestionChips } from "../components/Chat/SuggestionChips";
import { useWebSocket } from "../hooks/useWebSocket";
import { sendQuery } from "../lib/api";
import { useAlertStore } from "../stores/alertStore";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";
import { useCitiesStore } from "../stores/citiesStore";
import { useTranslation } from "react-i18next";
import { Alert } from "@devalok/shilp-sutra/ui/alert";
import { Spinner } from "@devalok/shilp-sutra/ui/spinner";

export function ChatPage() {
  const { sessionId, messages, addMessage } = useChatStore();
  const { userName } = useAuthStore();
  const { t } = useTranslation();
  const [thinking, setThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "recording" | "processing">("idle");
  const alerts = useAlertStore((s) => s.alerts);
  const activeCity = useCitiesStore((s) => s.activeCity);
  const savedCities = useCitiesStore((s) => s.cities);
  const locationHint = activeCity?.name || savedCities[0]?.name;
  const listRef = useRef<HTMLDivElement>(null);
  useWebSocket(sessionId);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages, thinking]);

  async function submit(text: string) {
    if (!text.trim()) return;
    addMessage({ id: crypto.randomUUID(), role: "user", text });
    setThinking(true);
    try {
      const response = await sendQuery(text, sessionId, voiceStatus !== "idle" ? "voice" : "text", locationHint);
      addMessage({ id: crypto.randomUUID(), role: "assistant", text: response.answer, response });
    } catch {
      addMessage({ id: crypto.randomUUID(), role: "assistant", text: t("chat.error", "That message couldn't be processed. Try rephrasing your weather question.") });
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="chat-page">
      {alerts.length > 0 && <Alert color="warning">{alerts[0].message}</Alert>}

      <div className="chat-page__messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="radar-container"><div className="radar-rings" /><div className="radar-sweep" /></div>
            <div style={{ position: "relative", fontSize: "2rem" }}>🌩</div>
            <h2 className="font-display" style={{ position: "relative" }}>{t("home.greeting", { name: userName || "" })}</h2>
            <p style={{ color: "var(--text-muted)", position: "relative" }}>What would you like to know about today's weather?</p>
            <div style={{ position: "relative", width: "100%" }}>
              <SuggestionChips onPick={submit} />
            </div>
          </div>
        )}
        {messages.map((m) => <ChatBubble key={m.id} message={m} />)}
        {voiceStatus === "recording" && <p style={{ color: "var(--teal)" }}>🎤 {t("chat.listening")}</p>}
        {voiceStatus === "processing" && <p style={{ color: "var(--teal)" }}>{t("chat.processing")}</p>}
        {thinking && <Spinner size="sm" />}
      </div>

      <ChatInput sessionId={sessionId} onSubmit={submit} voiceStatus={voiceStatus} onVoiceStatusChange={setVoiceStatus} />
    </div>
  );
}
