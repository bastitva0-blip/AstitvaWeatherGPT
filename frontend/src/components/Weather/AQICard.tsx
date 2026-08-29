import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import type { AqiResponse } from "../../lib/api";

function levelColor(label: string): "success" | "warning" | "error" {
  const l = label.toLowerCase();
  if (l.includes("good")) return "success";
  if (l.includes("moderate")) return "warning";
  return "error";
}

export function AQICard({ aqi }: { aqi: AqiResponse | null | undefined }) {
  if (!aqi) {
    return (
      <Card variant="default">
        <CardContent><p style={{ color: "var(--text-muted)" }}>AQI unavailable for this location</p></CardContent>
      </Card>
    );
  }
  const pct = Math.min(100, ((aqi.aqi_index * 100) / 5));
  const color = levelColor(aqi.aqi_label);
  const pollutants: [string, number, string][] = [
    ["PM2.5", aqi.pm2_5, "μg/m³"], ["PM10", aqi.pm10, "μg/m³"], ["CO", aqi.co, "μg/m³"], ["NO2", aqi.no2, "μg/m³"],
  ];
  return (
    <Card variant="default">
      <CardContent>
        <div className="aqi-card__number mono" style={{ fontSize: "3rem", fontWeight: 800 }}>{aqi.aqi_index}</div>
        <Badge color={color} variant="soft">{aqi.aqi_label}</Badge>
        <div className="aqi-bar" style={{ marginTop: "0.75rem" }}>
          <div className="aqi-bar__marker" style={{ left: `${pct}%` }} />
        </div>
        {pollutants.map(([label, value, unit]) => (
          <div key={label} className="aqi-pollutant-row">
            <span>{label}</span><span>{value} {unit}</span>
          </div>
        ))}
        <a href={aqi.source_url} target="_blank" rel="noreferrer"><Badge color="accent" variant="soft">{aqi.source}</Badge></a>
      </CardContent>
    </Card>
  );
}
