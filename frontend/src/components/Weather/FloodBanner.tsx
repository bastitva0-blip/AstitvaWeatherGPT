import { useState } from "react";
import { Banner } from "@devalok/shilp-sutra/ui/banner";

export function FloodBanner({ location, floodName, alertId }: { location: string; floodName: string; alertId: string }) {
  const [dismissed, setDismissed] = useState(sessionStorage.getItem(`flood_dismissed_${alertId}`) === "true");
  if (dismissed) return null;
  return (
    <Banner
      color="info"
      onDismiss={() => {
        sessionStorage.setItem(`flood_dismissed_${alertId}`, "true");
        setDismissed(true);
      }}
    >
      🌊 Flood Warning · {location} · {floodName}
    </Banner>
  );
}
