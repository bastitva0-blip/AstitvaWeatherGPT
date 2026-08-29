import { useState } from "react";
import { useChatStore } from "../stores/chatStore";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { EmptyState } from "@devalok/shilp-sutra/composed/empty-state";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { IconSearch } from "@tabler/icons-react";

const INTENT_COLOR: Record<string, "info" | "error" | "success" | "warning" | "neutral"> = {
  forecast: "info", alert: "error", fishing: "success", climate: "neutral",
  aqi: "warning", aviation: "neutral", agro: "success",
};

function group(_text: string) {
  return "Today"; // messages are session-scoped; single group is accurate without server timestamps
}

export function HistoryPage() {
  const messages = useChatStore((s) => s.messages);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const userMsgs = messages.filter((m) => m.role === "user" && m.text.toLowerCase().includes(search.toLowerCase()));
  const groups: Record<string, typeof userMsgs> = {};
  userMsgs.forEach((m) => { const g = group(m.text); (groups[g] ||= []).push(m); });

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="History" />
      <Input placeholder="Search history" value={search} onChange={(e) => setSearch(e.target.value)} startSection={<IconSearch />} style={{ width: "100%", marginBottom: "1rem" }} />

      {userMsgs.length === 0 ? (
        <EmptyState icon={<IconSearch />} title="Your weather queries will appear here" />
      ) : (
        Object.entries(groups).map(([label, items]) => (
          <div key={label}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", margin: "1rem 0 0.5rem" }}>{label}</div>
            {items.map((m) => {
              const response = messages.find((r) => r.role === "assistant" && messages.indexOf(r) === messages.indexOf(m) + 1);
              const intent = response?.response?.use_case_context || "forecast";
              return (
                <div key={m.id} className="settings-cell" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.4rem", cursor: "pointer" }} onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span><Badge color={INTENT_COLOR[intent] || "neutral"} variant="soft" style={{ marginRight: "0.5rem" }}>{intent}</Badge>{m.text}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {expanded === m.id && response && (
                    <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: "0.5rem" }}>{response.text}</div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
