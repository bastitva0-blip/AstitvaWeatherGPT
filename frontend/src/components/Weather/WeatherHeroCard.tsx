import { Badge } from "@devalok/shilp-sutra/ui/badge";
import type { WeatherData } from "../../lib/api";

export function WeatherHeroCard({ data, cityLabel, usingGps }: { data: WeatherData; cityLabel: string; usingGps?: boolean }) {
  const displayTemp = Math.round((data.temperature_max + data.temperature_min) / 2);
  const severity = data.cyclone_warning || data.flood_warning ? "warning" : data.heatwave_warning ? "watch" : null;

  return (
    <div className="hero-card">
      <div className="hero-card__top">
        <div>
          <div className="hero-card__city font-display">{cityLabel}</div>
          {usingGps && <div className="hero-card__gps">Using GPS ↓</div>}
        </div>
        {severity && (
          <Badge color={severity === "warning" ? "error" : "warning"} variant="solid">
            {data.cyclone_warning ? "Cyclone" : data.flood_warning ? "Flood" : "Heatwave"}
          </Badge>
        )}
      </div>
      <div className="hero-card__temp mono">{displayTemp}°C</div>
      <div className="hero-card__condition">{data.condition}</div>
      <div className="hero-card__range">
        {Math.round(data.temperature_min)} ~ {Math.round(data.temperature_max)}°C
        {data.rainfall_probability != null && ` · ${Math.round(data.rainfall_probability * 100)}% rain chance`}
      </div>
    </div>
  );
}
