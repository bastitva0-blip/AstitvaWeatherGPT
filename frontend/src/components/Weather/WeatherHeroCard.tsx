import { Badge } from "@devalok/shilp-sutra/ui/badge";
import type { WeatherData } from "../../lib/api";
import { HourlyStrip } from "./HourlyStrip";

const ALERT_COLOR: Record<string, "error" | "warning" | "neutral"> = { warning: "error", watch: "warning", advisory: "neutral" };

export function WeatherHeroCard({ data, cityLabel, usingGps }: { data: WeatherData; cityLabel: string; usingGps?: boolean }) {
  return (
    <div className="hero-card">
      <div className="hero-card__top">
        <div>
          <div className="hero-card__city font-display">{cityLabel}</div>
          {usingGps && <div className="hero-card__gps">Using GPS ↓</div>}
        </div>
        {data.alert_level && data.alert_level !== "none" && (
          <Badge color={ALERT_COLOR[data.alert_level] || "neutral"} variant="solid">{data.alert_level}</Badge>
        )}
      </div>
      <div className="hero-card__temp mono">{Math.round(data.temp)}°C</div>
      <div className="hero-card__condition">{data.condition}</div>
      <div className="hero-card__range">
        {data.temp_min != null && data.temp_max != null && `${Math.round(data.temp_min)} ~ ${Math.round(data.temp_max)}°C`}
        {data.feels_like != null && ` · Feels like ${Math.round(data.feels_like)}°C`}
      </div>
      {data.hourly && <HourlyStrip hourly={data.hourly} />}
    </div>
  );
}
