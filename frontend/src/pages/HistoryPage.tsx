import { useChatStore } from "../stores/chatStore";

export function HistoryPage() {
  const messages = useChatStore((s) => s.messages);
  return (
    <div className="history-page">
      <h1>History</h1>
      <ul>
        {messages
          .filter((m) => m.role === "user")
          .map((m) => (
            <li key={m.id}>{m.text}</li>
          ))}
      </ul>
    </div>
  );
}
