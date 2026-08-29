import { useState } from "react";
import { LocationPicker } from "../components/UI/LocationPicker";
import { subscribeAlert } from "../lib/api";
import { useAlertStore } from "../stores/alertStore";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { EmptyState } from "@devalok/shilp-sutra/composed/empty-state";
import { Banner } from "@devalok/shilp-sutra/ui/banner";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Slider } from "@devalok/shilp-sutra/ui/slider";
import { Switch } from "@devalok/shilp-sutra/ui/switch";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@devalok/shilp-sutra/ui/accordion";
import { IconCheck } from "@tabler/icons-react";

const THRESHOLD_TYPES = ["Rainfall", "Cyclone", "Heatwave", "Wave Height", "Marine Warning", "Fishermen Alert"];
const CATEGORICAL = ["Cyclone", "Heatwave", "Marine Warning", "Fishermen Alert"];
const ALERT_COLOR: Record<string, "error" | "warning" | "neutral" | "info"> = { warning: "error", watch: "warning", advisory: "neutral", flood: "info" };

export function AlertsPage() {
  const { alerts, dismiss } = useAlertStore();
  const { granted, enable } = usePushNotifications();
  const [location, setLocation] = useState("");
  const [thresholdType, setThresholdType] = useState("Rainfall");
  const [thresholdValue, setThresholdValue] = useState(50);
  const [subs, setSubs] = useState<{ location: string; type: string; value: number }[]>([]);
  const [digest, setDigest] = useState(false);

  const isCategorical = CATEGORICAL.includes(thresholdType);

  async function subscribe() {
    const value = isCategorical ? 1 : thresholdValue;
    await subscribeAlert(location, thresholdType.toLowerCase().replace(" ", "_"), value);
    setSubs((s) => [...s, { location, type: thresholdType, value }]);
  }

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="Alerts" />

      {!granted && (
        <Banner color="warning" actions={<Button variant="ghost" size="sm" onClick={enable}>Enable</Button>}>
          🔔 Enable push notifications to get alerts even when the app is closed.
        </Banner>
      )}
      {granted && <p style={{ color: "var(--safe)" }}><IconCheck size={16} style={{ verticalAlign: "middle" }} /> Push notifications active</p>}

      <section style={{ marginTop: "1rem" }}>
        <h2>Active alerts</h2>
        {alerts.length === 0 ? (
          <EmptyState title="No active alerts for your saved cities" compact />
        ) : (
          alerts.map((a, i) => (
            <div key={i} className={`alert-card alert-card--${a.severity}`}>
              {a.alert_type === "fishermen_alert" && <Badge color="error" variant="solid" style={{ marginBottom: "0.4rem" }}>⛵ DO NOT GO TO SEA</Badge>}
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                <Badge color={ALERT_COLOR[a.severity]} variant="soft">{a.severity.toUpperCase()}</Badge>
                {a.source_type === "wis2" && <Badge color="info" variant="soft">WIS2 · Live</Badge>}
              </div>
              <p>{a.message}</p>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.location} · {a.source}</span>
              <div><Button variant="outline" size="sm" onClick={() => dismiss(i)}>Dismiss</Button></div>
            </div>
          ))
        )}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Get notified before it happens</h2>
        <LocationPicker onSelect={setLocation} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", margin: "0.75rem 0" }}>
          {THRESHOLD_TYPES.map((t) => (
            <Button key={t} variant={thresholdType === t ? "soft" : "outline"} color={thresholdType === t ? "accent" : "neutral"} size="sm" onClick={() => setThresholdType(t)}>{t}</Button>
          ))}
        </div>
        {!isCategorical && (
          <div>
            <Slider
              min={0}
              max={thresholdType === "Wave Height" ? 10 : 200}
              value={[thresholdValue]}
              onValueChange={(v) => setThresholdValue(v[0])}
              showValue="always"
              formatValue={(v) => `${v}${thresholdType === "Wave Height" ? "m" : "mm"}`}
            />
          </div>
        )}
        <Button disabled={!location} onClick={subscribe} style={{ marginTop: "0.5rem" }}>Subscribe</Button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
          {subs.map((s, i) => <Badge key={i} color="accent" variant="soft">{s.location} · {s.type} · {s.value}</Badge>)}
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <Accordion type="single" collapsible>
          <AccordionItem value="sms">
            <AccordionTrigger>No smartphone? Get SMS alerts (coming soon)</AccordionTrigger>
            <AccordionContent>
              <Input type="tel" placeholder="Phone number" />
              <Button variant="outline" disabled style={{ marginLeft: "0.5rem" }}>SMS via Twilio — coming soon</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section style={{ marginTop: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Switch checked={digest} onCheckedChange={setDigest} />
          Daily 7am forecast for my primary city
        </label>
        {digest && <Input type="text" defaultValue="07:00 AM" style={{ marginTop: "0.5rem" }} />}
      </section>
    </div>
  );
}
