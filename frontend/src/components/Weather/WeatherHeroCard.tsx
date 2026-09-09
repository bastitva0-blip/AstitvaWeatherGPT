import { useTranslation } from "react-i18next";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import type { WeatherData } from "../../lib/api";

export function WeatherHeroCard({ data, cityLabel, usingGps }: {
  data: WeatherData; cityLabel: string; usingGps?: boolean;
}) {
  const { t } = useTranslation();
  const displayTemp = Math.round((data.temperature_max + data.temperature_min) / 2);
  const severity = data.cyclone_warning || data.flood_warning ? "warning"
    : data.heatwave_warning ? "watch" : null;

  const secondaryMetrics = [
    { label: t("weather.wind"),        value: data.wind_speed_kmh != null ? `${data.wind_speed_kmh} km/h` : "—" },
    { label: t("weather.humidity"),    value: data.humidity_percent != null ? `${data.humidity_percent}%` : "—" },
    { label: t("weather.visibility"), value: data.visibility_km != null ? `${data.visibility_km} km` : "—" },
    { label: t("weather.rainfall"),   value: data.rainfall_probability != null ? `${Math.round(data.rainfall_probability * 100)}%` : "—" },
  ];

  return (
    <div className="hero-card">
      <div className="hero-card__top">
        <div>
          <div className="hero-card__city font-display">{cityLabel}</div>
          {usingGps && <div className="hero-card__gps">{t("weather.using_gps")}</div>}
        </div>
        {severity && (
          <Badge color={severity === "warning" ? "error" : "warning"} variant="solid">
            {data.cyclone_warning ? t("weather.cyclone") : data.flood_warning ? t("weather.flood") : t("weather.heatwave")}
          </Badge>
        )}
      </div>
      <div className="hero-card__temp mono" aria-label={`${displayTemp} degrees Celsius`}>
        {displayTemp}°<span className="hero-card__unit">C</span>
      </div>
      <div className="hero-card__condition">{data.condition}</div>
      <div className="hero-card__range">
        {t("weather.range", { min: Math.round(data.temperature_min), max: Math.round(data.temperature_max) })}
        &nbsp;·&nbsp;{t("weather.feels_like", { temp: Math.round((data.temperature_max + data.temperature_min) / 2 + 3) })}
      </div>
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
