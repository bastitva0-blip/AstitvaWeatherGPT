import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// All 17 language files
import en from "./en.json";
import hi from "./hi.json";
import ta from "./ta.json";
import te from "./te.json";
import bn from "./bn.json";
import mr from "./mr.json";
import kn from "./kn.json";
import gu from "./gu.json";
import pa from "./pa.json";
import or from "./or.json";
import ml from "./ml.json";
import ur from "./ur.json";
import ar from "./ar.json";
import fr from "./fr.json";
import es from "./es.json";
import sw from "./sw.json";
import zh from "./zh.json";

const RTL_LANGS = new Set(["ar", "ur"]);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en }, hi: { translation: hi },
      ta: { translation: ta }, te: { translation: te },
      bn: { translation: bn }, mr: { translation: mr },
      kn: { translation: kn }, gu: { translation: gu },
      pa: { translation: pa }, or: { translation: or },
      ml: { translation: ml }, ur: { translation: ur },
      ar: { translation: ar }, fr: { translation: fr },
      es: { translation: es }, sw: { translation: sw },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "sanket_lang",
    },
  });

// Keep html[dir] and html[lang] in sync on every language change
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir  = RTL_LANGS.has(lng) ? "rtl" : "ltr";
});

// Apply immediately on load
const currentLang = i18n.language || "en";
document.documentElement.lang = currentLang;
document.documentElement.dir  = RTL_LANGS.has(currentLang) ? "rtl" : "ltr";

export default i18n;
