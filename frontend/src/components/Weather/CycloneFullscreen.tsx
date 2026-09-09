import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  alertId: string; cycloneName: string; distanceKm: number;
  severity: "Orange" | "Red"; isFisherman: boolean; onDismiss: () => void;
}

function playChime() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

export function CycloneFullscreen({ alertId, cycloneName, distanceKm, severity, isFisherman, onDismiss }: Props) {
  const { t } = useTranslation();
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    playChime();
    const timer = setTimeout(() => setCanDismiss(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    sessionStorage.setItem(`cyclone_dismissed_${alertId}`, "true");
    onDismiss();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#1A0000", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "2rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🌀</div>
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
        color: "#FF4444", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "2px",
      }}>
        {t("alerts.cyclone_title")}
      </h1>
      <p style={{ fontSize: "1.3rem", color: "#E8F4F8", marginBottom: "0.5rem" }}>
        {t("alerts.cyclone_body", { name: cycloneName })}
      </p>
      <p style={{ fontSize: "1rem", color: "#4A6B82", marginBottom: "1.5rem" }}>
        {t("alerts.cyclone_detail", { severity, distance: Math.round(distanceKm) })}
      </p>
      {isFisherman && (
        <div style={{
          background: "#FF4444", color: "#FFFFFF", padding: "0.75rem 2rem",
          borderRadius: 8, fontWeight: 800, fontSize: "1.1rem",
          marginBottom: "1.5rem", letterSpacing: "1px",
        }}>
          ⛵ {t("alerts.do_not_go_to_sea")}
        </div>
      )}
      <p style={{ fontSize: "0.9rem", color: "#4A6B82", marginBottom: "0.5rem" }}>
        {t("alerts.cyclone_instruction")}
      </p>
      <p style={{ fontSize: "0.75rem", color: "#1E3A52", marginBottom: "2rem" }}>
        {t("alerts.cyclone_source")}
      </p>
      <button
        onClick={dismiss}
        disabled={!canDismiss}
        style={{
          background: canDismiss ? "#FF4444" : "#1E3A52",
          color: canDismiss ? "#FFFFFF" : "#4A6B82",
          border: "none", borderRadius: 8, padding: "0.75rem 2rem",
          fontSize: "1rem", fontWeight: 700, cursor: canDismiss ? "pointer" : "not-allowed",
          transition: "all 0.3s",
        }}
      >
        {canDismiss ? t("alerts.cyclone_dismiss") : "⏳ 5s..."}
      </button>
    </div>
  );
}
