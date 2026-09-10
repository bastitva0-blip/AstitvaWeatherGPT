import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LocationPicker } from "../components/UI/LocationPicker";
import { fetchLiveWeather, fetchAqi, type WeatherData, type AqiResponse } from "../lib/api";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";

type Mode = "travelling" | "farming" | "fishing";

const MODE_META: Record<Mode, { label: string; icon: string; hint: string }> = {
  travelling: { label: "Travelling", icon: "✈️", hint: "Best air quality & least rain" },
  farming:    { label: "Farming",    icon: "🌾", hint: "Optimal rainfall & temperature" },
  fishing:    { label: "Fishing",    icon: "🎣", hint: "Calmer winds & safer conditions" },
};

const METRICS: { label: string; key: string; unit: string; icon: string }[] = [
  { label: "Temperature", key: "temperature", unit: "°C",   icon: "🌡" },
  { label: "Condition",   key: "condition",   unit: "",     icon: "☁️" },
  { label: "Humidity",    key: "humidity",    unit: "%",    icon: "💧" },
  { label: "Wind",        key: "wind",        unit: "km/h", icon: "💨" },
  { label: "Rainfall",    key: "rainfall",    unit: "mm",   icon: "🌧" },
  { label: "AQI",         key: "aqi",         unit: "",     icon: "🏭" },
];

function better(mode: Mode, metric: string, a?: number | null, b?: number | null): "a" | "b" | null {
  if (a == null || b == null) return null;
  if (mode === "fishing" && metric === "wind") return a < b ? "a" : "b";
  if (metric === "aqi") return a < b ? "a" : "b";
  if (metric === "rainfall") return mode === "farming" ? (a > b ? "a" : "b") : a < b ? "a" : "b";
  return null;
}

function getVal(metric: string, weather: WeatherData, aqi: AqiResponse | null) {
  if (metric === "temperature") return Math.round((weather.temperature_max + weather.temperature_min) / 2);
  if (metric === "condition")   return weather.condition;
  if (metric === "humidity")    return weather.humidity_percent;
  if (metric === "wind")        return weather.wind_speed_kmh;
  if (metric === "rainfall")    return weather.rainfall_mm;
  if (metric === "aqi")         return aqi?.aqi_index ?? null;
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
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  async function loadA(name: string) {
    setNameA(name);
    setParams({ a: name, b: nameB });
    setLoadingA(true);
    setA(await fetchLiveWeather(name));
    setLoadingA(false);
    fetchAqi(name).then(setAqiA).catch(() => setAqiA(null));
  }
  async function loadB(name: string) {
    setNameB(name);
    setParams({ a: nameA, b: name });
    setLoadingB(true);
    setB(await fetchLiveWeather(name));
    setLoadingB(false);
    fetchAqi(name).then(setAqiB).catch(() => setAqiB(null));
  }

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="Compare" />

      {/* Mode pills */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "2px" }}>
        {(Object.entries(MODE_META) as [Mode, typeof MODE_META[Mode]][]).map(([m, meta]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.45rem 0.875rem", borderRadius: "999px", flexShrink: 0,
              border: mode === m ? "1px solid var(--teal)" : "1px solid var(--border-bright)",
              background: mode === m ? "var(--teal-glow)" : "transparent",
              color: mode === m ? "var(--teal)" : "var(--text-muted)",
              fontWeight: mode === m ? 700 : 400, fontSize: "0.875rem", cursor: "pointer",
            }}
          >
            {meta.icon} {meta.label}
          </button>
        ))}
      </div>

      {/* City pickers — grid keeps both at 50% on any screen width */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div>
          <p style={{ margin: "0 0 0.35rem 0.25rem", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {loadingA ? "Loading…" : nameA ? nameA : "City A"}
          </p>
          <LocationPicker onSelect={loadA} placeholder="City A" />
        </div>
        <div>
          <p style={{ margin: "0 0 0.35rem 0.25rem", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {loadingB ? "Loading…" : nameB ? nameB : "City B"}
          </p>
          <LocationPicker onSelect={loadB} placeholder="City B" />
        </div>
      </div>

      {/* Empty state */}
      {!a && (
        <div style={{
          border: "2px dashed var(--border-bright)", borderRadius: "var(--radius-card)",
          padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📍</div>
          <p style={{ margin: 0 }}>Add City A to begin</p>
        </div>
      )}

      {a && !b && (
        <div style={{
          border: "2px dashed var(--border-bright)", borderRadius: "var(--radius-card)",
          padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)",
        }}>
          <div style={{ fontSize: "1.5rem" }}>+</div>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>Now add City B to compare</p>
        </div>
      )}

      {/* Comparison table */}
      {a && b && (
        <>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0 0 0.75rem" }}>
            {MODE_META[mode].icon} {MODE_META[mode].hint}
          </p>

          {/* City name headers */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", padding: "0 0.75rem", marginBottom: "0.35rem" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nameA}
            </span>
            <span />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nameB}
            </span>
          </div>

          {/* Metric rows */}
          <div style={{ borderRadius: "var(--radius-card)", overflow: "hidden", border: "1px solid var(--border-bright)" }}>
            {METRICS.map((m, i) => {
              const va = getVal(m.key, a, aqiA);
              const vb = getVal(m.key, b, aqiB);
              const win = typeof va === "number" && typeof vb === "number"
                ? better(mode, m.key, va, vb)
                : null;
              const isEven = i % 2 === 0;

              return (
                <div
                  key={m.key}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 2fr",
                    alignItems: "center",
                    background: isEven ? "var(--bg-elevated)" : "var(--bg-surface)",
                    borderBottom: i < METRICS.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  {/* City A */}
                  <div style={{
                    padding: "0.75rem",
                    borderRadius: "0",
                    background: win === "a" ? "rgba(0,212,170,0.08)" : "transparent",
                    display: "flex", alignItems: "center", gap: "0.4rem",
                  }}>
                    {win === "a" && (
                      <span style={{ color: "var(--teal)", fontSize: "0.8rem", fontWeight: 700 }}>✓</span>
                    )}
                    <span style={{
                      fontFamily: typeof va === "number" ? "var(--font-mono)" : "inherit",
                      fontWeight: 700, fontSize: "1rem",
                      color: win === "a" ? "var(--teal)" : "var(--text-primary)",
                    }}>
                      {va != null ? String(va) : "—"}
                    </span>
                    {m.unit && (
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.unit}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                    <div style={{ fontSize: "1rem" }}>{m.icon}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "2px" }}>{m.label}</div>
                  </div>

                  {/* City B */}
                  <div style={{
                    padding: "0.75rem",
                    background: win === "b" ? "rgba(0,212,170,0.08)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem",
                  }}>
                    {m.unit && (
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.unit}</span>
                    )}
                    <span style={{
                      fontFamily: typeof vb === "number" ? "var(--font-mono)" : "inherit",
                      fontWeight: 700, fontSize: "1rem",
                      color: win === "b" ? "var(--teal)" : "var(--text-primary)",
                    }}>
                      {vb != null ? String(vb) : "—"}
                    </span>
                    {win === "b" && (
                      <span style={{ color: "var(--teal)", fontSize: "0.8rem", fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
