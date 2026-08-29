import { create } from "zustand";

export interface AlertPayload {
  type: string;
  location: string;
  alert_type: string;
  message: string;
  severity: "advisory" | "watch" | "warning" | "flood";
  source: string;
  fishing_zone_safe: boolean | null;
  timestamp: string;
  source_type?: "wis2" | "polled" | "gdacs";
}

interface AlertState {
  alerts: AlertPayload[];
  lastWIS2MessageAt: Date | null;
  pushAlert: (a: AlertPayload) => void;
  dismiss: (index: number) => void;
  setLastWIS2Message: (at: Date) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  lastWIS2MessageAt: null,
  pushAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts].slice(0, 50) })),
  dismiss: (index) => set((s) => ({ alerts: s.alerts.filter((_, i) => i !== index) })),
  setLastWIS2Message: (at) => set({ lastWIS2MessageAt: at }),
}));
