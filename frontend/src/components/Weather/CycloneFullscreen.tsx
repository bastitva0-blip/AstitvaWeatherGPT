import { useEffect, useState } from "react";
import { Button } from "@devalok/shilp-sutra/ui/button";

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // AudioContext blocked — silent fail, that's fine
  }
}

export function CycloneFullscreen({
  alertId, cycloneName, distanceKm, severity, sourceUrl, isFisherman, onDismiss,
}: {
  alertId: string; cycloneName: string; distanceKm: number; severity: string; sourceUrl?: string;
  isFisherman?: boolean; onDismiss: () => void;
}) {
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    playChime();
    const t = setTimeout(() => setCanDismiss(true), 5000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem(`cyclone_dismissed_${alertId}`, "true");
    onDismiss();
  }

  return (
    <div className="cyclone-fullscreen">
      {isFisherman && <div className="cyclone-fullscreen__fisherman-banner">⛵ DO NOT GO TO SEA</div>}
      <div className="cyclone-fullscreen__icon">⚠</div>
      <h1 className="cyclone-fullscreen__title font-display">CYCLONE WARNING</h1>
      <p style={{ fontSize: "1.2rem" }}>Cyclone {cycloneName}</p>
      <p>{severity} Alert · {distanceKm}km from you</p>
      <p style={{ opacity: 0.7 }}>Source: GDACS / JTWC</p>
      <div className="cyclone-fullscreen__box">
        Stay indoors. Avoid coastal areas. Monitor IMD updates.
      </div>
      {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#fff", marginBottom: "1rem" }}>View full alert details</a>}
      {canDismiss && (
        <Button variant="outline" style={{ color: "#fff", borderColor: "#fff" }} onClick={dismiss}>
          I understand — dismiss
        </Button>
      )}
    </div>
  );
}
