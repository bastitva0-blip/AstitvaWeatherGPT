import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import bn from "./bn.json";
import en from "./en.json";
import gu from "./gu.json";
import hi from "./hi.json";
import kn from "./kn.json";
import ml from "./ml.json";
import mr from "./mr.json";
import or from "./or.json";
import pa from "./pa.json";
import ta from "./ta.json";
import te from "./te.json";
import ur from "./ur.json";

i18n.use(initReactI18next).init({
  resources: {
    hi: { translation: hi }, ta: { translation: ta }, te: { translation: te },
    bn: { translation: bn }, mr: { translation: mr }, kn: { translation: kn },
    gu: { translation: gu }, pa: { translation: pa }, or: { translation: or },
    ml: { translation: ml }, ur: { translation: ur }, en: { translation: en },
  },
  lng: "hi",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
