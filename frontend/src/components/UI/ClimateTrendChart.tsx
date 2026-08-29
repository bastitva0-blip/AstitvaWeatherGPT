import { AreaChart } from "@devalok/shilp-sutra/ui/charts/area-chart";

interface Point { year: number; value: number; [key: string]: string | number | Date }

export function ClimateTrendChart({ data, unit }: { data: Point[]; unit: string }) {
  if (!data.length) return <p style={{ color: "var(--text-muted)" }}>No historical records available for this location/parameter.</p>;
  return (
    <AreaChart
      data={data}
      xKey="year"
      series={[{ key: "value", label: unit, color: "chart-1" }]}
      curved
      gradient
      height={300}
      showGrid
      showTooltip
      yLabel={unit}
    />
  );
}
