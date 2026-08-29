import { StatCard } from "@devalok/shilp-sutra/ui/stat-card";
import { IconTemperature, IconWind, IconDroplet, IconSun, IconEye, IconGauge } from "@tabler/icons-react";
import type { WeatherData } from "../../lib/api";

function windDir(deg?: number) {
  if (deg == null) return "—";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}
function beaufort(kmh?: number) {
  if (kmh == null) return "";
  if (kmh < 6) return "F0";
  if (kmh < 20) return "F2";
  if (kmh < 39) return "F4";
  if (kmh < 62) return "F6";
  return "F8+";
}

export function StatGrid({ data }: { data: WeatherData }) {
  const cells = [
    { icon: <IconTemperature />, label: "Feels like", value: data.feels_like != null ? `${Math.round(data.feels_like)}°C` : "—" },
    { icon: <IconWind />, label: "Wind", value: `${windDir(data.wind_direction_deg)} ${data.wind_speed_kmh ?? "—"}km/h ${beaufort(data.wind_speed_kmh)}` },
    { icon: <IconDroplet />, label: "Humidity", value: data.humidity != null ? `${data.humidity}%` : "—" },
    { icon: <IconSun />, label: "UV", value: data.uv != null ? `${data.uv}` : "—" },
    { icon: <IconEye />, label: "Visibility", value: data.visibility_km != null ? `${data.visibility_km}km` : "—" },
    { icon: <IconGauge />, label: "Pressure", value: data.pressure_hpa != null ? `${data.pressure_hpa}hPa` : "—" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
      {cells.map((c) => (
        <StatCard key={c.label} size="sm" label={c.label} value={c.value} icon={c.icon} accentStyle="icon" />
      ))}
    </div>
  );
}
