import type { AlertPayload } from "../stores/alertStore";

export function AlertToast({ alert, onDismiss }: { alert: AlertPayload; onDismiss: () => void }) {
  const isFishermenAlert = alert.alert_type === "fishermen_alert";
  return (
    <div className={`alert-toast alert-toast--${alert.severity}`}>
      {isFishermenAlert && <strong className="alert-toast__banner">Do not go to sea</strong>}
      <p>{alert.message}</p>
      <span>{alert.location}</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}
