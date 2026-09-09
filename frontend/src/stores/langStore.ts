import { create } from "zustand";
import i18n from "../i18n";

const RTL_LANGS = new Set(["ar", "ur"]);

interface LangStore {
  lang: string;
  setLang: (lang: string) => void;
}

export const useLangStore = create<LangStore>((set) => ({
  lang: localStorage.getItem("sanket_lang") || "en",
  setLang: (lang: string) => {
    localStorage.setItem("sanket_lang", lang);
    // Change i18next language — triggers languageChanged event which updates html[dir] + html[lang]
    i18n.changeLanguage(lang);
    set({ lang });
  },
}));
