import { create } from "zustand";

export const SUPPORTED_LANGS = ["hi", "ta", "te", "bn", "mr", "kn", "gu", "pa", "or", "ml", "ur", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: "hi",
  setLang: (l) => set({ lang: l }),
}));
