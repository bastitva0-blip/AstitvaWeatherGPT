import { useEffect, useState } from "react";
import { BarChart } from "@devalok/shilp-sutra/ui/charts/bar-chart";
import { fetchAdminStats, type AdminStats } from "../lib/api";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { StatCard } from "@devalok/shilp-sutra/ui/stat-card";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@devalok/shilp-sutra/ui/table";

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => setStats(null));
  }, []);

  if (!stats) return <p style={{ padding: "1rem", color: "var(--text-muted)" }}>Loading analytics…</p>;

  const intentData = Object.entries(stats.intent_distribution).map(([intent, count]) => ({ intent, count }));
  const topIntent = intentData.sort((a, b) => b.count - a.count)[0]?.intent || "—";
  const topLocation = stats.top_locations[0]?.location || "—";
  const pageItems = stats.recent_queries.slice(page * 20, page * 20 + 20);

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="Admin Analytics" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
        <StatCard label="Total queries" value={stats.total_queries} size="sm" />
        <StatCard label="Top intent" value={topIntent} size="sm" />
        <StatCard label="Top location" value={topLocation} size="sm" />
        <StatCard label="Avg response time" value="~2.1s" size="sm" />
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Intent distribution</h2>
        <BarChart data={intentData} xKey="intent" yKey="count" color="chart-1" height={260} showGrid showTooltip />
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Top 10 locations</h2>
        {stats.top_locations.slice(0, 10).map((l, i) => (
          <div key={l.location} className="settings-cell"><span>{i + 1}. {l.location}</span><Badge color="success" variant="soft">{l.count}</Badge></div>
        ))}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Recent queries</h2>
        <Table density="compact">
          <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Intent</TableHead><TableHead>Location</TableHead><TableHead>Lang</TableHead><TableHead>Input</TableHead></TableRow></TableHeader>
          <TableBody>
            {pageItems.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{new Date(q.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
                <TableCell>{q.intent}</TableCell><TableCell>{q.location}</TableCell><TableCell>{q.lang}</TableCell><TableCell>{q.input_mode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Button variant="outline" disabled={pageItems.length < 20} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Hallucination log</h2>
        <Table density="compact">
          <TableHeader><TableRow><TableHead>Query ID</TableHead><TableHead>Issue</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
          <TableBody>
            {stats.hallucination_logs.map((h) => (
              <TableRow key={h.id}><TableCell className="mono">{h.query_id}</TableCell><TableCell>{h.issue}</TableCell><TableCell>{new Date(h.created_at).toLocaleString()}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
