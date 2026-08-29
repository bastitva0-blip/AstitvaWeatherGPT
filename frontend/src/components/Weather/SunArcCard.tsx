import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";

export function SunArcCard({ sunrise, sunset }: { sunrise?: string; sunset?: string }) {
  if (!sunrise || !sunset) return null;
  const now = Date.now();
  const sr = new Date(sunrise).getTime();
  const ss = new Date(sunset).getTime();
  const frac = Math.min(1, Math.max(0, (now - sr) / (ss - sr)));
  const angle = Math.PI * (1 - frac);
  const cx = 100 + 90 * Math.cos(angle);
  const cy = 100 - 90 * Math.sin(angle);
  const remaining = Math.max(0, Math.round((ss - now) / 60000));

  return (
    <Card variant="default">
      <CardContent style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {remaining > 0 ? `${Math.floor(remaining / 60)}h ${remaining % 60}m daylight remaining` : "Night"}
        </div>
        <svg width="200" height="110" viewBox="0 0 200 110">
          <path d="M10,100 A90,90 0 0 1 190,100" fill="none" stroke="var(--border-bright)" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="6" fill="var(--teal)" />
          <text x="10" y="108" fontSize="10" fill="var(--text-muted)">{new Date(sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</text>
          <text x="150" y="108" fontSize="10" fill="var(--text-muted)">{new Date(sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</text>
        </svg>
      </CardContent>
    </Card>
  );
}
