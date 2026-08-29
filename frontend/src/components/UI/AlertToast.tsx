import { useEffect } from "react";
import { Alert } from "@devalok/shilp-sutra/ui/alert";
import type { AlertPayload } from "../../stores/alertStore";

const COLOR: Record<AlertPayload["severity"], "error" | "warning" | "neutral" | "info"> = {
  warning: "error", watch: "warning", advisory: "neutral", flood: "info",
};

export function AlertToast({ alert, onDismiss }: { alert: AlertPayload; onDismiss: () => void }) {
  const auto = alert.severity === "advisory";
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [auto, onDismiss]);

  return (
    <Alert color={COLOR[alert.severity]} title={alert.location} onDismiss={onDismiss}>
      {alert.message}
    </Alert>
  );
}
