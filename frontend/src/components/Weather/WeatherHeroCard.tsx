import { Badge } from "@devalok/shilp-sutra/ui/badge";
import type { WeatherData } from "../../lib/api";

// CHANGE 5: Visual hierarchy — temperature & condition are the heroes.
// Secondary metrics (wind, humidity, visibility, rainfall) moved to
// a distinct 2×2 grid with lower-contrast background cards.

export function WeatherHeroCard({
  data,
  cityLabel,
  usingGps,
}: {
  data: WeatherData;
  cityLabel: string;
  usingGps?: boolean;
}) {
  const displayTemp = Math.round((data.temperature_max + data.temperature_min) / 2);
  const severity =
    data.cyclone_warning || data.flood_warning
      ? "warning"
      : data.heatwave_warning
      ? "watch"
      : null;

  const secondaryMetrics = [
    { label: "Wind",       value: data.wind_speed_kmh != null ? `${data.wind_speed_kmh} km/h` : "—" },
    { label: "Humidity",   value: data.humidity_percent != null ? `${data.humidity_percent}%` : "—" },
    { label: "Visibility", value: data.visibility_km != null ? `${data.visibility_km} km` : "—" },
    { label: "Rain",       value: data.rainfall_probability != null ? `${Math.round(data.rainfall_probability * 100)}%` : "—" },
  ];

  return (
    <div className="hero-card">
      {/* City + alert badge */}
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

      {/* PRIMARY — large temperature */}
      <div className="hero-card__temp mono" aria-label={`${displayTemp} degrees Celsius`}>
        {displayTemp}°
        <span className="hero-card__unit">C</span>
      </div>

      {/* PRIMARY — condition, prominent */}
      <div className="hero-card__condition">{data.condition}</div>

      {/* Range line */}
      <div className="hero-card__range">
        {Math.round(data.temperature_min)} ~ {Math.round(data.temperature_max)}°C
        &nbsp;·&nbsp;Feels like {Math.round((data.temperature_max + data.temperature_min) / 2 + 3)}°C
      </div>

      {/* SECONDARY metrics — 2×2 grid, low-contrast bg */}
      <div className="hero-card__metrics" aria-label="Weather metrics">
        {secondaryMetrics.map((m) => (
          <div key={m.label} className="hero-card__metric">
            <span className="hero-card__metric-label">{m.label}</span>
            <span className="hero-card__metric-value mono">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
