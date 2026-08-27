import { useState } from "react";
import { AlertToast } from "../components/AlertToast";
import { LocationPicker } from "../components/LocationPicker";
import { subscribeAlert } from "../lib/api";
import { useAlertStore } from "../stores/alertStore";

const THRESHOLD_TYPES = ["rainfall", "cyclone", "heatwave", "wave_height", "marine_warning", "fishermen_alert"];

export function AlertsPage() {
  const { alerts, dismiss } = useAlertStore();
  const [location, setLocation] = useState("");
  const [thresholdType, setThresholdType] = useState("rainfall");
  const [thresholdValue, setThresholdValue] = useState(50);

  return (
    <div className="alerts-page">
      <h1>Alerts</h1>
      <section>
        <h2>Subscribe</h2>
        <LocationPicker onSelect={setLocation} />
        <select value={thresholdType} onChange={(e) => setThresholdType(e.target.value)}>
          {THRESHOLD_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="number"
          value={thresholdValue}
          onChange={(e) => setThresholdValue(Number(e.target.value))}
        />
        <button
          disabled={!location}
          onClick={() => subscribeAlert(location, thresholdType, thresholdValue)}
        >
          Subscribe
        </button>
      </section>
      <section>
        {alerts.map((a, i) => (
          <AlertToast key={i} alert={a} onDismiss={() => dismiss(i)} />
        ))}
      </section>
    </div>
  );
}
