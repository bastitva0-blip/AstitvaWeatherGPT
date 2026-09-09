import { useState } from "react";
import { LocationPicker } from "../components/UI/LocationPicker";
import { subscribeAlert } from "../lib/api";
import { useAlertStore } from "../stores/alertStore";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Slider } from "@devalok/shilp-sutra/ui/slider";
import { Switch } from "@devalok/shilp-sutra/ui/switch";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@devalok/shilp-sutra/ui/accordion";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";

const THRESHOLD_TYPES: { id: string; label: string; icon: string; categorical: boolean; maxVal?: number; unitLabel?: string }[] = [
  { id: "Rainfall",        label: "Rainfall",        icon: "🌧",  categorical: false, maxVal: 200, unitLabel: "mm" },
  { id: "Cyclone",         label: "Cyclone",          icon: "🌀",  categorical: true  },
  { id: "Heatwave",        label: "Heatwave",         icon: "🔥",  categorical: true  },
  { id: "Wave Height",     label: "Wave Height",      icon: "🌊",  categorical: false, maxVal: 10,  unitLabel: "m"  },
  { id: "Marine Warning",  label: "Marine Warning",   icon: "⛵",  categorical: true  },
  { id: "Fishermen Alert", label: "Fishermen Alert",  icon: "🎣",  categorical: false, maxVal: 200, unitLabel: "mm" },
];

const SEVERITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  warning:  { bg: "rgba(255,68,68,0.08)",  border: "#FF4444", text: "#FF4444"  },
  watch:    { bg: "rgba(255,149,0,0.08)",  border: "#FF9500", text: "#FF9500"  },
  advisory: { bg: "rgba(100,116,139,0.1)", border: "#64748B", text: "#94A3B8" },
  flood:    { bg: "rgba(59,130,246,0.08)", border: "#3B82F6", text: "#3B82F6"  },
};

export function AlertsPage() {
  const { alerts, dismiss } = useAlertStore();
  const { granted, enable } = usePushNotifications();
  const [location, setLocation] = useState("");
  const [thresholdType, setThresholdType] = useState("Rainfall");
  const [thresholdValue, setThresholdValue] = useState(50);
  const [subs, setSubs] = useState<{ location: string; type: string; value: number }[]>([]);
  const [digest, setDigest] = useState(false);

  const currentType = THRESHOLD_TYPES.find((t) => t.id === thresholdType)!;

  async function subscribe() {
    const value = currentType.categorical ? 1 : thresholdValue;
    await subscribeAlert(location, thresholdType.toLowerCase().replace(" ", "_"), value);
    setSubs((s) => [...s, { location, type: thresholdType, value }]);
  }

  return (
    <div style={{ padding: "1rem", paddingBottom: "2rem" }}>
      <PageHeader title="Alerts" />

      {/* Push notification banner */}
      {!granted ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.3)",
          borderRadius: "12px", padding: "0.75rem 1rem", marginBottom: "1.25rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.25rem" }}>🔔</span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
              Enable push to get alerts when app is closed
            </span>
          </div>
          <button
            onClick={enable}
            style={{
              background: "var(--saffron)", color: "#000", border: "none",
              borderRadius: "8px", padding: "0.4rem 0.75rem",
              fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", flexShrink: 0,
            }}
          >
            Enable
          </button>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          color: "var(--teal)", fontSize: "0.875rem", marginBottom: "1.25rem",
          padding: "0.6rem 0.75rem",
          background: "rgba(0,212,170,0.07)",
          borderRadius: "10px", border: "1px solid rgba(0,212,170,0.2)",
        }}>
          <span>✓</span>
          <span>Push notifications active</span>
        </div>
      )}

      {/* Active alerts */}
      <section style={{ marginBottom: "1.75rem" }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "0.8rem", color: "var(--text-muted)",
          textTransform: "uppercase", letterSpacing: "0.08em",
          margin: "0 0 0.75rem",
        }}>
          Active alerts
        </p>

        {alerts.length === 0 ? (
          <div style={{
            border: "1px dashed var(--border-bright)",
            borderRadius: "var(--radius-card)", padding: "2rem",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🛡</div>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
              No active alerts for your saved cities
            </p>
          </div>
        ) : (
          alerts.map((a, i) => {
            const colors = SEVERITY_COLORS[a.severity] ?? SEVERITY_COLORS.advisory;
            return (
              <div key={i} style={{
                background: colors.bg, border: `1px solid ${colors.border}`,
                borderRadius: "12px", padding: "1rem", marginBottom: "0.75rem",
              }}>
                {a.alert_type === "fishermen_alert" && (
                  <div style={{
                    background: "var(--danger)", color: "#fff",
                    borderRadius: "6px", padding: "0.3rem 0.6rem",
                    fontWeight: 700, fontSize: "0.8rem",
                    display: "inline-flex", gap: "0.3rem",
                    marginBottom: "0.6rem",
                  }}>
                    ⛵ DO NOT GO TO SEA
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{
                    background: `${colors.border}22`, color: colors.text,
                    borderRadius: "6px", padding: "0.2rem 0.6rem",
                    fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.06em",
                  }}>
                    {a.severity.toUpperCase()}
                  </span>
                  {a.source_type === "wis2" && (
                    <span style={{
                      background: "rgba(59,130,246,0.15)", color: "#3B82F6",
                      borderRadius: "6px", padding: "0.2rem 0.6rem",
                      fontWeight: 600, fontSize: "0.72rem",
                    }}>
                      WIS2 · Live
                    </span>
                  )}
                </div>
                <p style={{ margin: "0 0 0.4rem", color: "var(--text-primary)", fontSize: "0.9rem" }}>{a.message}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {a.location} · {a.source}
                  </span>
                  <button
                    onClick={() => dismiss(i)}
                    style={{
                      background: "none", border: "1px solid var(--border-bright)",
                      borderRadius: "6px", padding: "0.2rem 0.6rem",
                      color: "var(--text-muted)", fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Subscribe section */}
      <section>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "0.8rem", color: "var(--text-muted)",
          textTransform: "uppercase", letterSpacing: "0.08em",
          margin: "0 0 0.75rem",
        }}>
          Get notified before it happens
        </p>

        {/* Location picker */}
        <div style={{ marginBottom: "1rem" }}>
          <LocationPicker onSelect={setLocation} />
        </div>

        {/* Alert type grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem", marginBottom: "1.25rem",
        }}>
          {THRESHOLD_TYPES.map((t) => {
            const active = thresholdType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setThresholdType(t.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "0.35rem", padding: "0.75rem 0.5rem",
                  background: active ? "var(--teal-glow)" : "var(--bg-elevated)",
                  border: active ? "1.5px solid var(--teal)" : "1px solid var(--border-bright)",
                  borderRadius: "12px", cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>{t.icon}</span>
                <span style={{
                  fontSize: "0.65rem", fontWeight: active ? 700 : 400,
                  color: active ? "var(--teal)" : "var(--text-muted)",
                  textAlign: "center", lineHeight: 1.2,
                }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Threshold slider (only for numeric types) */}
        {!currentType.categorical && (
          <div style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
            borderRadius: "12px", padding: "1rem", marginBottom: "1rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Alert threshold</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontWeight: 700,
                fontSize: "0.9rem", color: "var(--teal)",
              }}>
                {thresholdValue} {currentType.unitLabel}
              </span>
            </div>
            <Slider
              min={0}
              max={currentType.maxVal ?? 200}
              value={[thresholdValue]}
              onValueChange={(v) => setThresholdValue(v[0])}
              showValue="always"
              formatValue={(v) => `${v}${currentType.unitLabel}`}
            />
          </div>
        )}

        {currentType.categorical && (
          <div style={{
            background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "12px", padding: "0.875rem", marginBottom: "1rem",
            fontSize: "0.82rem", color: "var(--text-muted)",
          }}>
            📢 You'll be alerted immediately when any {currentType.label.toLowerCase()} event is detected.
          </div>
        )}

        {/* Subscribe button */}
        <button
          disabled={!location}
          onClick={subscribe}
          style={{
            width: "100%", padding: "0.875rem",
            background: location ? "var(--teal)" : "var(--bg-elevated)",
            color: location ? "var(--bg-deep)" : "var(--text-muted)",
            border: "none", borderRadius: "12px",
            fontWeight: 700, fontSize: "0.95rem",
            cursor: location ? "pointer" : "not-allowed",
            fontFamily: "var(--font-display)",
          }}
        >
          {location ? `Subscribe for ${location}` : "Set a location first"}
        </button>

        {/* Active subscriptions */}
        {subs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
            {subs.map((s, i) => (
              <span key={i} style={{
                background: "var(--teal-glow)", border: "1px solid rgba(0,212,170,0.3)",
                borderRadius: "999px", padding: "0.3rem 0.7rem",
                fontSize: "0.75rem", color: "var(--teal)",
              }}>
                {s.location} · {s.type}
                {!THRESHOLD_TYPES.find(t => t.id === s.type)?.categorical && ` · ${s.value}`}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* SMS section */}
      <section style={{ marginTop: "1.5rem" }}>
        <div style={{
          background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <Accordion type="single" collapsible>
            <AccordionItem value="sms" style={{ border: "none" }}>
              <AccordionTrigger style={{ padding: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>
                📱 No smartphone? Get SMS alerts <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: "0.35rem" }}>(coming soon)</span>
              </AccordionTrigger>
              <AccordionContent style={{ padding: "0 1rem 1rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Input type="tel" placeholder="Phone number" />
                  <Button variant="outline" disabled>Notify via SMS</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Daily digest toggle */}
      <section style={{ marginTop: "1rem" }}>
        <div style={{
          background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
          borderRadius: "12px", padding: "1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
              Daily 7am forecast
            </p>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Morning brief for your primary city
            </p>
          </div>
          <Switch checked={digest} onCheckedChange={setDigest} />
        </div>
        {digest && (
          <div style={{ marginTop: "0.5rem", padding: "0 0.25rem" }}>
            <Input type="text" defaultValue="07:00 AM" placeholder="Time" />
          </div>
        )}
      </section>
    </div>
  );
}
