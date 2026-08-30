import { useEffect, useState } from "react";
import { Banner } from "@devalok/shilp-sutra/ui/banner";
import { useOnlineStatus, getCachedTimestamp } from "../../hooks/useOnlineStatus";

export function OfflineBanner({ route }: { route: string }) {
  const online = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!online) setDismissed(false);
    const t = setTimeout(() => setDismissed(false), 60000);
    return () => clearTimeout(t);
  }, [online]);

  if (online || dismissed) return null;
  const cachedAt = getCachedTimestamp(route);
  const mins = cachedAt ? Math.round((Date.now() - cachedAt.getTime()) / 60000) : null;

  return (
    <Banner color="warning" onDismiss={() => setDismissed(true)}>
      ⚡ Offline, showing data cached {mins != null ? `${mins} minutes ago` : "earlier"}
    </Banner>
  );
}
