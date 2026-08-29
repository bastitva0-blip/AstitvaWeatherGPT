import { Button } from "@devalok/shilp-sutra/ui/button";

const SUGGESTIONS = [
  "Will it rain in my city today?",
  "Is it safe to fish on the coast?",
  "AQI near me",
  "7-day forecast for Delhi",
  "Cyclone warnings active?",
  "Wheat crop advisory Ludhiana",
  "VIDP airport weather",
];

export function SuggestionChips({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="chat-suggestions">
      {SUGGESTIONS.map((s) => (
        <Button key={s} variant="soft" size="compact-sm" shape="pill" onClick={() => onPick(s)}>{s}</Button>
      ))}
    </div>
  );
}
