import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "../components/Chat/ChatBubble";
import { ChatInput } from "../components/Chat/ChatInput";
import { QuickActions } from "../components/Chat/QuickActions";
import { useWebSocket } from "../hooks/useWebSocket";
import { useOfflineCache } from "../hooks/useOfflineCache";
import { sendQuery, type DetailLevel } from "../lib/api";
import { useAlertStore } from "../stores/alertStore";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";
import { useCitiesStore } from "../stores/citiesStore";
import { useLangStore } from "../stores/langStore";
import { useTranslation } from "react-i18next";
import { Alert } from "@devalok/shilp-sutra/ui/alert";
import { Spinner } from "@devalok/shilp-sutra/ui/spinner";

export function ChatPage() {
  const { sessionId, messages, addMessage } = useChatStore();
  const { userName } = useAuthStore();
  const { lang } = useLangStore();
  const { t } = useTranslation();
  const [thinking, setThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "recording" | "processing">("idle");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("short");
  const [offlineCached, setOfflineCached] = useState<import("../hooks/useOfflineCache").CachedAnswer[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const alerts = useAlertStore((s) => s.alerts);
  const activeCity = useCitiesStore((s) => s.activeCity);
  const savedCities = useCitiesStore((s) => s.cities);
  const locationHint = activeCity?.name || savedCities[0]?.name;
  const listRef = useRef<HTMLDivElement>(null);
  const { saveToCache, getCached } = useOfflineCache();
  useWebSocket(sessionId);

  // Track online/offline
  useEffect(() => {
    const on  = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Load offline cache when offline
  useEffect(() => {
    if (isOffline) getCached().then(setOfflineCached);
  }, [isOffline]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages, thinking]);

  async function submit(text: string) {
    if (!text.trim()) return;
    addMessage({ id: crypto.randomUUID(), role: "user", text });
    setThinking(true);
    try {
      const response = await sendQuery(
        text, sessionId,
        voiceStatus !== "idle" ? "voice" : "text",
        locationHint, detailLevel,
      );
      addMessage({ id: crypto.randomUUID(), role: "assistant", text: response.answer, response });

      // Save to offline cache
      await saveToCache({
        query: text,
        answer: response.answer,
        location: response.weather_summary.location || locationHint || "unknown",
        timestamp: new Date().toISOString(),
        lang,
      });
    } catch (err) {
      console.error("sendQuery failed:", err);
      addMessage({
        id: crypto.randomUUID(), role: "assistant",
        text: t("chat.error", "That message couldn't be processed. Try rephrasing your weather question."),
      });
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="chat-page">
      {alerts.length > 0 && <Alert color="warning">{alerts[0].message}</Alert>}

      {/* Offline banner */}
      {isOffline && (
        <div style={{
          background: "var(--saffron-dim)", border: "1px solid var(--saffron)",
          borderRadius: 8, padding: "0.6rem 1rem", margin: "0.5rem",
          fontSize: "0.85rem", color: "var(--saffron)",
        }}>
          📡 You're offline — showing last cached answers below
        </div>
      )}

      <div className="chat-page__messages" ref={listRef}>
        {/* Offline cached answers */}
        {isOffline && messages.length === 0 && offlineCached.length > 0 && (
          <div style={{ padding: "0.5rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              Last {offlineCached.length} cached answer{offlineCached.length > 1 ? "s" : ""}:
            </p>
            {offlineCached.map((c, i) => (
              <div key={i} style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "0.75rem",
                marginBottom: "0.5rem", border: "1px solid var(--border)",
              }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                  {c.location} · {new Date(c.timestamp).toLocaleString()}
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--teal)", fontStyle: "italic" }}>
                  Q: {c.query}
                </p>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.9rem" }}>{c.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Normal chat */}
        {messages.length === 0 && !isOffline && (
          <div className="chat-empty">
            <div className="radar-container"><div className="radar-rings" /><div className="radar-sweep" /></div>
            <div style={{ position: "relative", fontSize: "2rem" }}>🌩</div>
            <h2 className="font-display" style={{ position: "relative" }}>
              {t("home.greeting", { name: userName || "" })}
            </h2>
            <p style={{ color: "var(--text-muted)", position: "relative" }}>
              What would you like to know about today's weather?
            </p>
            <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
              <QuickActions onPick={submit} />
            </div>
          </div>
        )}

        {messages.map((m) => <ChatBubble key={m.id} message={m} />)}
        {voiceStatus === "recording" && <p style={{ color: "var(--teal)" }}>🎤 {t("chat.listening")}</p>}
        {voiceStatus === "processing" && <p style={{ color: "var(--teal)" }}>{t("chat.processing")}</p>}
        {thinking && <Spinner size="sm" />}
      </div>

      <ChatInput
        sessionId={sessionId} onSubmit={submit}
        voiceStatus={voiceStatus} onVoiceStatusChange={setVoiceStatus}
        detailLevel={detailLevel} onDetailLevelChange={setDetailLevel}
      />
    </div>
  );
}
