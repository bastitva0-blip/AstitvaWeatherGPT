import { StatCard } from "@devalok/shilp-sutra/ui/stat-card";
import { IconWind, IconDroplet, IconEye, IconCloudRain } from "@tabler/icons-react";
import type { WeatherData } from "../../lib/api";

export function StatGrid({ data }: { data: WeatherData }) {
  const cells = [
    { icon: <IconWind />, label: "Wind", value: `${data.wind_direction ?? "N/A"} ${data.wind_speed_kmh ?? "N/A"}km/h` },
    { icon: <IconDroplet />, label: "Humidity", value: data.humidity_percent != null ? `${data.humidity_percent}%` : "N/A" },
    { icon: <IconEye />, label: "Visibility", value: data.visibility_km != null ? `${data.visibility_km}km` : "N/A" },
    { icon: <IconCloudRain />, label: "Rainfall", value: `${data.rainfall_mm ?? 0}mm` },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
      {cells.map((c) => (
        <StatCard key={c.label} size="sm" label={c.label} value={c.value} icon={c.icon} accentStyle="icon" />
      ))}
    </div>
  );
}
