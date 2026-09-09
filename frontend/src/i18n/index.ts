import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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

// Read saved language from localStorage (set by langStore)
const savedLang = localStorage.getItem("sanket_lang") || "en";

i18n
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
    lng: savedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

// Sync html[dir] + html[lang] on every language change
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir  = RTL_LANGS.has(lng) ? "rtl" : "ltr";
});

// Apply on first load
document.documentElement.lang = savedLang;
document.documentElement.dir  = RTL_LANGS.has(savedLang) ? "rtl" : "ltr";

export default i18n;
