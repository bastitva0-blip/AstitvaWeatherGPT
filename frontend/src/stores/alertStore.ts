import { create } from "zustand";

export interface AlertPayload {
  type: string;
  location: string;
  alert_type: string;
  message: string;
  severity: "advisory" | "watch" | "warning";
  source: string;
  fishing_zone_safe: boolean | null;
  timestamp: string;
}

interface AlertState {
  alerts: AlertPayload[];
  pushAlert: (a: AlertPayload) => void;
  dismiss: (index: number) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  pushAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts].slice(0, 50) })),
  dismiss: (index) => set((s) => ({ alerts: s.alerts.filter((_, i) => i !== index) })),
}));
