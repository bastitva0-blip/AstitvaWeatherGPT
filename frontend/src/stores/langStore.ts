import { create } from "zustand";

export const SUPPORTED_LANGS = [
  "hi", "ta", "te", "bn", "mr", "kn", "gu", "pa", "or", "ml", "ur", "en",
  "ar", "fr", "es", "zh", "sw",
] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: (localStorage.getItem("wgpt_lang") as Lang) || "hi",
  setLang: (l) => {
    localStorage.setItem("wgpt_lang", l);
    set({ lang: l });
  },
}));
