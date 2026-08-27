import { useEffect, useRef } from "react";
import { useAlertStore, type AlertPayload } from "../stores/alertStore";

export function useWebSocket(sessionId: string) {
  const pushAlert = useAlertStore((s) => s.pushAlert);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsBase = import.meta.env.VITE_WS_BASE as string | undefined;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = wsBase
      ? `${wsBase}/ws/alerts/${sessionId}`
      : `${proto}://${window.location.host}/ws/alerts/${sessionId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as AlertPayload;
        pushAlert(payload);
      } catch {
        // ignore malformed frames
      }
    };

    return () => ws.close();
  }, [sessionId, pushAlert]);

  return wsRef;
}
