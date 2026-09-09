import { create } from "zustand";
import i18n from "../i18n";

const RTL_LANGS = new Set(["ar", "ur"]);

export type Lang =
  | "hi" | "ta" | "te" | "bn" | "mr" | "kn" | "gu" | "pa" | "or" | "ml"
  | "ur" | "en" | "ar" | "fr" | "es" | "zh" | "sw";

export const SUPPORTED_LANGS: { code: Lang; native: string; roman: string }[] = [
  { code: "en", native: "English",    roman: "English"    },
  { code: "hi", native: "हिन्दी",     roman: "Hindi"      },
  { code: "ta", native: "தமிழ்",      roman: "Tamil"      },
  { code: "te", native: "తెలుగు",     roman: "Telugu"     },
  { code: "bn", native: "বাংলা",      roman: "Bengali"    },
  { code: "mr", native: "मराठी",      roman: "Marathi"    },
  { code: "kn", native: "ಕನ್ನಡ",      roman: "Kannada"    },
  { code: "gu", native: "ગુજરાતી",    roman: "Gujarati"   },
  { code: "pa", native: "ਪੰਜਾਬੀ",     roman: "Punjabi"    },
  { code: "or", native: "ଓଡ଼ିଆ",      roman: "Odia"       },
  { code: "ml", native: "മലയാളം",     roman: "Malayalam"  },
  { code: "ur", native: "اردو",       roman: "Urdu"       },
  { code: "ar", native: "العربية",    roman: "Arabic"     },
  { code: "fr", native: "Français",   roman: "French"     },
  { code: "es", native: "Español",    roman: "Spanish"    },
  { code: "sw", native: "Kiswahili",  roman: "Swahili"    },
  { code: "zh", native: "中文",        roman: "Chinese"    },
];

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangStore>((set) => ({
  lang: (localStorage.getItem("sanket_lang") as Lang) || "en",
  setLang: (lang: Lang) => {
    localStorage.setItem("sanket_lang", lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir  = RTL_LANGS.has(lang) ? "rtl" : "ltr";
    set({ lang });
  },
}));
