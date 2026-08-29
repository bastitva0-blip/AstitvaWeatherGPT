import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LocationPicker } from "../components/UI/LocationPicker";
import { fetchLiveWeather, fetchAqi, type WeatherData, type AqiResponse } from "../lib/api";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";

type Mode = "travelling" | "farming" | "fishing";

function better(mode: Mode, metric: string, a?: number | null, b?: number | null): "a" | "b" | null {
  if (a == null || b == null) return null;
  if (mode === "fishing" && metric === "wind") return a < b ? "a" : "b";
  if (metric === "aqi") return a < b ? "a" : "b";
  if (metric === "rainfall") return mode === "farming" ? (a > b ? "a" : "b") : a < b ? "a" : "b";
  return null;
}

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const [a, setA] = useState<WeatherData | null>(null);
  const [b, setB] = useState<WeatherData | null>(null);
  const [aqiA, setAqiA] = useState<AqiResponse | null>(null);
  const [aqiB, setAqiB] = useState<AqiResponse | null>(null);
  const [nameA, setNameA] = useState(params.get("a") || "");
  const [nameB, setNameB] = useState(params.get("b") || "");
  const [mode, setMode] = useState<Mode>("travelling");

  async function loadA(name: string) {
    setNameA(name);
    setParams({ a: name, b: nameB });
    setA(await fetchLiveWeather(name));
    fetchAqi(name).then(setAqiA).catch(() => setAqiA(null));
  }
  async function loadB(name: string) {
    setNameB(name);
    setParams({ a: nameA, b: name });
    setB(await fetchLiveWeather(name));
    fetchAqi(name).then(setAqiB).catch(() => setAqiB(null));
  }

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="Compare" />
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["Travelling", "Farming", "Fishing"] as const).map((m) => (
          <Button key={m} variant={mode === m.toLowerCase() ? "soft" : "outline"} color={mode === m.toLowerCase() ? "accent" : "neutral"} size="sm" onClick={() => setMode(m.toLowerCase() as Mode)}>{m}</Button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <LocationPicker onSelect={loadA} placeholder="City A" />
        <LocationPicker onSelect={loadB} placeholder="City B" />
      </div>

      {!a && <p style={{ color: "var(--text-muted)" }}>Add City A to begin.</p>}
      {a && !b && <div className="compare-placeholder">+ Add a city to compare</div>}

      {a && b && (
        <div className="compare-cols">
          {[
            ["Temperature", Math.round((a.temperature_max + a.temperature_min) / 2), Math.round((b.temperature_max + b.temperature_min) / 2), ""],
            ["Condition", a.condition, b.condition, ""],
            ["Humidity", a.humidity_percent, b.humidity_percent, ""],
            ["Wind (km/h)", a.wind_speed_kmh, b.wind_speed_kmh, "wind"],
            ["Rainfall (mm)", a.rainfall_mm, b.rainfall_mm, "rainfall"],
            ["AQI", aqiA?.aqi_index, aqiB?.aqi_index, "aqi"],
          ].map(([label, av, bv, metric]) => {
            const win = typeof metric === "string" && metric ? better(mode, metric, Number(av), Number(bv)) : null;
            return (
              <div key={label as string} className="compare-row" style={{ gridColumn: "1/-1", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div className={`compare-cell ${win === "a" ? "compare-cell--winner" : ""}`}>{label}: {String(av ?? "—")}</div>
                <div className={`compare-cell ${win === "b" ? "compare-cell--winner" : ""}`}>{label}: {String(bv ?? "—")}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
