import { useState } from "react";
import type { DailyForecast } from "../../lib/api";
import { HourlyStrip } from "./HourlyStrip";

const ICONS: Record<string, string> = {
  clear: "☀", sunny: "☀", cloudy: "⛅", overcast: "☁", rain: "🌧", thunderstorm: "⛈", snow: "❄", fog: "🌫",
};

export function ForecastRow({ day }: { day: DailyForecast }) {
  const [open, setOpen] = useState(false);
  const dow = new Date(day.date).toLocaleDateString([], { weekday: "short" });
  return (
    <div>
      <button
        className="forecast-row"
        style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ width: 40 }}>{dow}</span>
        <span>{ICONS[(day.condition || "").toLowerCase()] || "🌤"}</span>
        <span style={{ color: "var(--text-muted)" }}>{day.rain_prob != null ? `${day.rain_prob}%` : "—"}</span>
        <span className="mono">{Math.round(day.temp_min)}°</span>
        <span className="mono">{Math.round(day.temp_max)}°</span>
      </button>
      {open && day.hourly && <HourlyStrip hourly={day.hourly} />}
    </div>
  );
}
