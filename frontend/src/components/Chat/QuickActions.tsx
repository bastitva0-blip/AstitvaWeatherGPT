const QUICK_ACTIONS = [
  { label: "Try Weather Check", query: "Will it rain in my city today?" },
  { label: "Try ATC Check", query: "VIDP airport weather" },
  { label: "Try Fisherman Check", query: "Is it safe to fish on the coast?" },
  { label: "Try Farmer Advisory", query: "Wheat crop advisory Ludhiana" },
  { label: "Try Disaster Alert", query: "Cyclone warnings active?" },
];

export function QuickActions({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="chat-quick-actions">
      {QUICK_ACTIONS.map((a) => (
        <button key={a.label} type="button" className="chat-quick-actions__box" onClick={() => onPick(a.query)}>
          {a.label}
        </button>
      ))}
    </div>
  );
}
