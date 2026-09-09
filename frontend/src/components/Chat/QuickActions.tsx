import { useTranslation } from "react-i18next";

const QUICK_ACTIONS = [
  { key: "weather",  emoji: "🌤", query_en: "What's the weather today?" },
  { key: "atc",      emoji: "✈️", query_en: "METAR for VIDP airport" },
  { key: "fisherman",emoji: "🎣", query_en: "Is it safe to go fishing today?" },
  { key: "farmer",   emoji: "🌾", query_en: "Agro advisory for wheat today" },
  { key: "disaster", emoji: "🌊", query_en: "Any cyclone or flood alerts near me?" },
];

export function QuickActions({ onPick }: { onPick: (text: string) => void }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
      {QUICK_ACTIONS.map((a) => (
        <button
          key={a.key}
          onClick={() => onPick(a.query_en)}
          style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 20, padding: "0.45rem 1rem",
            color: "var(--text-muted)", cursor: "pointer",
            fontSize: "0.85rem", display: "flex", gap: "0.35rem", alignItems: "center",
          }}
        >
          {a.emoji} {t(`quick.${a.key}`)}
        </button>
      ))}
    </div>
  );
}
