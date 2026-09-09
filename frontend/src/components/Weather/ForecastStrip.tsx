import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetch7DayForecast, type DayForecast } from "../../lib/api";
import { Skeleton } from "@devalok/shilp-sutra/ui/skeleton";

function windDir(deg: number): string {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}
function rainIcon(mm: number): string {
  if (mm === 0)  return "☀️";
  if (mm < 1)    return "🌤";
  if (mm < 5)    return "🌦";
  if (mm < 10)   return "🌧";
  return "⛈";
}

export function ForecastStrip({ location }: { location: string }) {
  const { t } = useTranslation();
  const [days, setDays]     = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    if (!location) return;
    setLoading(true); setError(false);
    fetch7DayForecast(location)
      .then((r) => setDays(r.forecast))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [location]);

  if (loading) return (
    <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", padding: "0.5rem 0" }}>
      {[...Array(7)].map((_, i) => <Skeleton key={i} style={{ width: 80, height: 110, flexShrink: 0, borderRadius: 10 }} />)}
    </div>
  );

  if (error || days.length === 0) return (
    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t("weather.forecast_unavailable")}</p>
  );

  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "0.4rem" }}>
        {t("weather.forecast_title")}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
        {days.map((d, i) => {
          const label = i === 0 ? t("weather.today") : new Date(d.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
          return (
            <div key={d.date} style={{
              background: i === 0 ? "var(--teal-glow)" : "var(--bg-elevated)",
              border: `1px solid ${i === 0 ? "var(--teal)" : "var(--border)"}`,
              borderRadius: 10, padding: "0.65rem 0.75rem",
              minWidth: 76, flexShrink: 0, textAlign: "center",
            }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: i === 0 ? "var(--teal)" : "var(--text-muted)", fontWeight: 600 }}>{label}</p>
              <p style={{ margin: "0.35rem 0", fontSize: "1.5rem", lineHeight: 1 }}>{rainIcon(d.rainfall_mm_per_hr)}</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(d.temperature_c)}°</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.65rem", color: "var(--text-muted)" }}>💧 {d.rainfall_mm_per_hr}mm</p>
              <p style={{ margin: "0.1rem 0 0", fontSize: "0.65rem", color: "var(--text-muted)" }}>💨 {Math.round(d.wind_speed_kmh)} {windDir(d.wind_direction_deg)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
