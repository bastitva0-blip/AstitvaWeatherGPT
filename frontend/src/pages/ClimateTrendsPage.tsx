import { useState } from "react";
import { ClimateTrendChart } from "../components/UI/ClimateTrendChart";
import { LocationPicker } from "../components/UI/LocationPicker";
import { fetchClimateTrend } from "../lib/api";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Banner } from "@devalok/shilp-sutra/ui/banner";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";

interface TrendResponse {
  location: string;
  parameter: string;
  unit: string;
  data: { year: number; value: number }[];
  trend: { direction: string; change_per_decade: number };
  citations: { source: string; detail: string; url: string }[];
}

const PARAMETERS = ["rainfall", "temperature", "humidity"];

export function ClimateTrendsPage() {
  const [parameter, setParameter] = useState("rainfall");
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const [empty, setEmpty] = useState(false);
  const [loc, setLoc] = useState("");

  async function load(location: string) {
    setLoc(location);
    try {
      const result = (await fetchClimateTrend(location, parameter)) as TrendResponse;
      setTrend(result);
      setEmpty(result.data.length === 0);
    } catch {
      setEmpty(true);
    }
  }

  function downloadCsv() {
    if (!trend) return;
    const rows = ["year,value", ...trend.data.map((d) => `${d.year},${d.value}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trend.location}-${trend.parameter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="Climate Trends" />

      {empty && (
        <Banner color="warning" actions={<Button variant="ghost" size="sm" onClick={() => load(loc)}>Retry</Button>}>
          No historical data found for {loc || "this location"} — try a major city like Delhi or Mumbai.
        </Banner>
      )}

      <LocationPicker onSelect={load} />
      <div style={{ display: "flex", gap: "0.5rem", margin: "0.75rem 0" }}>
        {PARAMETERS.map((p) => (
          <Button key={p} variant={parameter === p ? "soft" : "outline"} color={parameter === p ? "accent" : "neutral"} size="sm" onClick={() => setParameter(p)}>{p}</Button>
        ))}
      </div>

      {trend && trend.data.length > 0 && (
        <>
          <Badge color={trend.trend.direction === "increasing" ? "warning" : trend.trend.direction === "decreasing" ? "info" : "neutral"} variant="soft">
            {trend.trend.direction === "increasing" ? "↑" : trend.trend.direction === "decreasing" ? "↓" : "→"} {trend.trend.direction} · {trend.trend.change_per_decade}/decade
          </Badge>
          <div style={{ margin: "1rem 0" }}>
            <ClimateTrendChart data={trend.data} unit={trend.unit} />
          </div>
          <Button onClick={downloadCsv}>Download CSV</Button>
          <ul>
            {trend.citations.map((c, i) => <li key={i}><a href={c.url} target="_blank" rel="noreferrer">{c.source}</a>: {c.detail}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
