import type { HourlyPoint } from "../../lib/api";

const ICONS: Record<string, string> = {
  clear: "☀", sunny: "☀", cloudy: "⛅", overcast: "☁", rain: "🌧", thunderstorm: "⛈", snow: "❄", fog: "🌫",
};

export function HourlyStrip({ hourly }: { hourly: HourlyPoint[] }) {
  if (!hourly?.length) return null;
  return (
    <div className="hourly-strip">
      {hourly.map((h, i) => (
        <div key={i} className="hourly-strip__item">
          <span>{i === 0 ? "Now" : h.time}</span>
          <span>{ICONS[(h.condition || "").toLowerCase()] || "🌤"}</span>
          <span className="hourly-strip__temp mono">{Math.round(h.temp)}°</span>
        </div>
      ))}
    </div>
  );
}
