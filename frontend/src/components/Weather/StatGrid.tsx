import { useTranslation } from "react-i18next";
import type { WeatherData } from "../../lib/api";

interface StatItem {
  label: string;
  value: string;
  unit: string;
  icon: string;
  accent?: boolean;
}

export function StatGrid({ data }: { data: WeatherData }) {
  const { t } = useTranslation();

  const stats: StatItem[] = [
    {
      label: t("weather.rainfall"),
      value: data.rainfall_mm != null ? String(data.rainfall_mm) : "—",
      unit: "mm",
      icon: "🌧",
      accent: (data.rainfall_mm ?? 0) > 10,
    },
    {
      label: t("weather.humidity"),
      value: data.humidity_percent != null ? String(data.humidity_percent) : "—",
      unit: "%",
      icon: "💧",
    },
    {
      label: t("weather.wind"),
      value: data.wind_speed_kmh != null ? String(data.wind_speed_kmh) : "—",
      unit: "km/h",
      icon: "💨",
      accent: (data.wind_speed_kmh ?? 0) > 30,
    },
    {
      label: t("weather.wave_height"),
      value: data.wave_height_m != null ? String(data.wave_height_m) : "—",
      unit: "m",
      icon: "🌊",
    },
    {
      label: t("weather.visibility"),
      value: data.visibility_km != null ? String(data.visibility_km) : "—",
      unit: "km",
      icon: "👁",
    },
    {
      label: t("weather.nwp_model"),
      value: "GFS",
      unit: "Open-Meteo",
      icon: "📡",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0.6rem",
        margin: "0.75rem 0",
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: s.accent
              ? "rgba(0, 212, 170, 0.07)"
              : "var(--bg-elevated)",
            border: s.accent
              ? "1px solid rgba(0, 212, 170, 0.25)"
              : "1px solid var(--border-bright)",
            borderRadius: "12px",
            padding: "0.875rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          {/* Icon */}
          <span style={{ fontSize: "1.15rem", lineHeight: 1, marginBottom: "0.5rem" }}>
            {s.icon}
          </span>

          {/* Value */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: "1.15rem",
              color: s.accent ? "var(--teal)" : "var(--text-primary)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {s.value}
          </span>

          {/* Unit */}
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "var(--teal)",
              letterSpacing: "0.04em",
              marginTop: "0.2rem",
              marginBottom: "0.25rem",
            }}
          >
            {s.unit}
          </span>

          {/* Label */}
          <span
            style={{
              fontSize: "0.63rem",
              color: "var(--text-muted)",
              lineHeight: 1.3,
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
