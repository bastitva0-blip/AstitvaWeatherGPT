import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Point {
  year: number;
  value: number;
}

export function ClimateTrendChart({ data, unit }: { data: Point[]; unit: string }) {
  if (!data.length) return <p>No historical records available for this location/parameter.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis label={{ value: unit, angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#1D4ED8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
