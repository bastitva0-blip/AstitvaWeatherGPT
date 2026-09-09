import { useState } from "react";
import { useTranslation } from "react-i18next";

export function FloodBanner({ location, floodName, alertId }: {
  location: string; floodName: string; alertId: string;
}) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(
    sessionStorage.getItem(`flood_dismissed_${alertId}`) === "true"
  );
  if (dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(`flood_dismissed_${alertId}`, "true");
    setDismissed(true);
  }

  return (
    <div style={{
      background: "rgba(59,130,246,0.15)", borderBottom: "2px solid #3B82F6",
      padding: "0.75rem 1rem", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: "0.75rem",
    }}>
      <span style={{ fontSize: "1.25rem" }}>🌊</span>
      <div style={{ flex: 1 }}>
        <strong style={{ color: "#3B82F6", fontSize: "0.9rem" }}>
          {t("alerts.flood_warning")} — {location}
        </strong>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#4A6B82" }}>{floodName}</p>
      </div>
      <button
        onClick={dismiss}
        style={{
          background: "none", border: "1px solid #3B82F6", color: "#3B82F6",
          borderRadius: 6, padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
        }}
      >
        {t("alerts.dismiss")}
      </button>
    </div>
  );
}
