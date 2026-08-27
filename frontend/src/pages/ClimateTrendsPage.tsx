import { useState } from "react";
import { ClimateTrendChart } from "../components/ClimateTrendChart";
import { LocationPicker } from "../components/LocationPicker";
import { fetchClimateTrend } from "../lib/api";

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

  async function load(location: string) {
    const result = (await fetchClimateTrend(location, parameter)) as TrendResponse;
    setTrend(result);
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
    <div className="climate-trends-page">
      <h1>Climate Trends</h1>
      <LocationPicker onSelect={load} />
      <select value={parameter} onChange={(e) => setParameter(e.target.value)}>
        {PARAMETERS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      {trend && (
        <>
          <span className={`trend-badge trend-badge--${trend.trend.direction}`}>
            {trend.trend.direction} ({trend.trend.change_per_decade}/decade)
          </span>
          <ClimateTrendChart data={trend.data} unit={trend.unit} />
          <button onClick={downloadCsv}>Download CSV</button>
          <ul>
            {trend.citations.map((c, i) => (
              <li key={i}>{c.source}: {c.detail}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
