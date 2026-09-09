import { useTranslation } from "react-i18next";
import type { WeatherData } from "../../lib/api";

export function StatGrid({ data }: { data: WeatherData }) {
  const { t } = useTranslation();
  const stats = [
    { label: t("weather.rainfall"),    value: data.rainfall_mm != null ? `${data.rainfall_mm} mm` : "—", icon: "🌧" },
    { label: t("weather.humidity"),    value: data.humidity_percent != null ? `${data.humidity_percent}%` : "—", icon: "💧" },
    { label: t("weather.wind"),        value: data.wind_speed_kmh != null ? `${data.wind_speed_kmh} km/h` : "—", icon: "💨" },
    { label: t("weather.wave_height"), value: data.wave_height_m != null ? `${data.wave_height_m} m` : "—", icon: "🌊" },
    { label: t("weather.visibility"),  value: data.visibility_km != null ? `${data.visibility_km} km` : "—", icon: "👁" },
    { label: t("weather.nwp_model"),   value: "GFS / Open-Meteo", icon: "📡" },
  ];
  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <span className="stat-card__icon">{s.icon}</span>
          <span className="stat-card__value mono">{s.value}</span>
          <span className="stat-card__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
