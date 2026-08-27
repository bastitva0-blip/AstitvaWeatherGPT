import { SUPPORTED_LANGS, useLangStore, type Lang } from "../stores/langStore";

const LABELS: Record<Lang, string> = {
  hi: "हिन्दी", ta: "தமிழ்", te: "తెలుగు", bn: "বাংলা", mr: "मराठी", kn: "ಕನ್ನಡ",
  gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ", or: "ଓଡ଼ିଆ", ml: "മലയാളം", ur: "اردو", en: "English",
};

export function LanguageSelect() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return (
    <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="language-select">
      {SUPPORTED_LANGS.map((l) => (
        <option key={l} value={l}>
          {LABELS[l]}
        </option>
      ))}
    </select>
  );
}
