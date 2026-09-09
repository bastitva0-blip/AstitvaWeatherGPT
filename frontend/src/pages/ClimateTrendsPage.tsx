import { useState } from "react";
import { ClimateTrendChart } from "../components/UI/ClimateTrendChart";
import { LocationPicker } from "../components/UI/LocationPicker";
import { fetchClimateTrend } from "../lib/api";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Button } from "@devalok/shilp-sutra/ui/button";

interface TrendResponse {
  location: string;
  parameter: string;
  unit: string;
  data: { year: number; value: number }[];
  trend: { direction: string; change_per_decade: number };
  citations: { source: string; detail: string; url: string }[];
}

const PARAMETERS: { id: string; label: string; icon: string; unit: string }[] = [
  { id: "rainfall",    label: "Rainfall",    icon: "🌧", unit: "mm"  },
  { id: "temperature", label: "Temperature", icon: "🌡", unit: "°C"  },
  { id: "humidity",    label: "Humidity",    icon: "💧", unit: "%"   },
];

const DIR_STYLE: Record<string, { bg: string; border: string; color: string; arrow: string }> = {
  increasing: { bg: "rgba(255,149,0,0.1)",  border: "rgba(255,149,0,0.3)",  color: "#FF9500", arrow: "↑" },
  decreasing: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", color: "#3B82F6", arrow: "↓" },
  stable:     { bg: "rgba(100,116,139,0.1)",border: "rgba(100,116,139,0.3)",color: "#94A3B8", arrow: "→" },
};

export function ClimateTrendsPage() {
  const [trends, setTrends] = useState<(TrendResponse | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [loc, setLoc] = useState("");
  const [noData, setNoData] = useState(false);

  async function load(location: string) {
    setLoc(location);
    setLoading(true);
    setNoData(false);

    const results = await Promise.all(
      PARAMETERS.map((p) =>
        (fetchClimateTrend(location, p.id) as Promise<TrendResponse>).catch(() => null)
      )
    );
    setTrends(results);
    setLoading(false);

    const allEmpty = results.every((r) => !r || r.data.length === 0);
    setNoData(allEmpty);
  }

  function downloadCsv(trend: TrendResponse) {
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
    <div style={{ padding: "1rem", paddingBottom: "2rem" }}>
      <PageHeader title="Climate Trends" />

      {/* Location picker */}
      <div style={{ marginBottom: "1.25rem" }}>
        <LocationPicker onSelect={load} />
      </div>

      {/* No data warning */}
      {noData && (
        <div style={{
          background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.3)",
          borderRadius: "12px", padding: "0.875rem 1rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-primary)",
        }}>
          <span>⚠️ No historical data for <strong>{loc}</strong>. Try a major city like Delhi or Mumbai.</span>
          <button
            onClick={() => load(loc)}
            style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {PARAMETERS.map((p) => (
            <div key={p.id} style={{
              background: "var(--bg-elevated)", borderRadius: "var(--radius-card)",
              height: "240px", border: "1px solid var(--border-bright)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", fontSize: "0.875rem",
            }}>
              {p.icon} Loading {p.label}…
            </div>
          ))}
        </div>
      )}

      {/* Three charts stacked */}
      {!loading && trends.some((t) => t && t.data.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {PARAMETERS.map((param, idx) => {
            const trend = trends[idx];
            if (!trend || trend.data.length === 0) return null;
            const dir = DIR_STYLE[trend.trend.direction] ?? DIR_STYLE.stable;

            return (
              <div key={param.id} style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-bright)",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
              }}>
                {/* Card header */}
                <div style={{
                  padding: "0.875rem 1rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>{param.icon}</span>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700,
                      fontSize: "0.95rem", color: "var(--text-primary)",
                    }}>
                      {param.label}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      ({trend.unit})
                    </span>
                  </div>

                  {/* Trend badge */}
                  <div style={{
                    background: dir.bg, border: `1px solid ${dir.border}`,
                    borderRadius: "999px", padding: "0.25rem 0.7rem",
                    fontSize: "0.75rem", fontWeight: 700, color: dir.color,
                    display: "flex", alignItems: "center", gap: "0.3rem",
                  }}>
                    {dir.arrow} {trend.trend.direction}
                    <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                      · {trend.trend.change_per_decade}/decade
                    </span>
                  </div>
                </div>

                {/* Chart */}
                <div style={{ padding: "0.75rem 0.5rem 0.25rem" }}>
                  <ClimateTrendChart data={trend.data} unit={trend.unit} />
                </div>

                {/* Footer actions */}
                <div style={{
                  padding: "0.6rem 1rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex", justifyContent: "flex-end",
                }}>
                  <button
                    onClick={() => downloadCsv(trend)}
                    style={{
                      background: "none", border: "1px solid var(--border-bright)",
                      borderRadius: "8px", padding: "0.3rem 0.75rem",
                      color: "var(--text-muted)", fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    ↓ CSV
                  </button>
                </div>
              </div>
            );
          })}

          {/* Citations */}
          {trends.filter(Boolean).flatMap((t) => t!.citations).length > 0 && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0 0.25rem" }}>
              <p style={{ margin: "0 0 0.4rem", fontWeight: 600 }}>Sources</p>
              <ul style={{ margin: 0, paddingLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {[...new Map(
                  trends.filter(Boolean).flatMap((t) => t!.citations).map((c) => [c.url, c])
                ).values()].map((c, i) => (
                  <li key={i}>
                    <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "var(--teal)" }}>
                      {c.source}
                    </a>: {c.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty — no location set yet */}
      {!loading && !loc && (
        <div style={{
          border: "2px dashed var(--border-bright)", borderRadius: "var(--radius-card)",
          padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📈</div>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Set a location to see rainfall, temperature & humidity trends together
          </p>
        </div>
      )}
    </div>
  );
}
