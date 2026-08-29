import { create } from "zustand";

interface AuthState {
  authed: boolean;
  userName: string | null;
  userEmail: string | null;
  firstRun: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authed: localStorage.getItem("wgpt_authed") === "true",
  userName: localStorage.getItem("wgpt_name"),
  userEmail: localStorage.getItem("wgpt_email"),
  firstRun: localStorage.getItem("wgpt_onboarded") !== "true",
  login: (name, email) => {
    localStorage.setItem("wgpt_authed", "true");
    localStorage.setItem("wgpt_name", name);
    localStorage.setItem("wgpt_email", email);
    set({ authed: true, userName: name, userEmail: email });
  },
  logout: () => {
    ["wgpt_authed", "wgpt_name", "wgpt_email"].forEach((k) => localStorage.removeItem(k));
    set({ authed: false, userName: null, userEmail: null });
  },
  completeOnboarding: () => {
    localStorage.setItem("wgpt_onboarded", "true");
    set({ firstRun: false });
  },
}));
