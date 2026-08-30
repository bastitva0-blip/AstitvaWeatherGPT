import { useState } from "react";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconWorld, IconCheck } from "@tabler/icons-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@devalok/shilp-sutra/ui/sheet";
import { useLangStore, type Lang } from "../../stores/langStore";

const INDIAN: Lang[] = ["hi", "ta", "te", "bn", "mr", "kn", "gu", "pa", "or", "ml", "ur", "en"];
const INTL: Lang[] = ["ar", "fr", "es", "zh", "sw"];

/** One flat, saturated hue per language, Hotstar/Netflix-style tile picker. */
const COLORS: Record<Lang, string> = {
  hi: "#E63946", ta: "#F4A261", te: "#2A9D8F", bn: "#8E44AD", mr: "#E76F51",
  kn: "#457B9D", gu: "#F1C40F", pa: "#06A77D", or: "#D62839", ml: "#3D5A80",
  ur: "#588157", en: "#1D3557", ar: "#BC6C25", fr: "#3A86FF", es: "#FB5607",
  zh: "#D00000", sw: "#2B9348",
};

const LABELS: Record<Lang, { native: string; roman: string }> = {
  hi: { native: "हिन्दी", roman: "Hindi" },
  ta: { native: "தமிழ்", roman: "Tamil" },
  te: { native: "తెలుగు", roman: "Telugu" },
  bn: { native: "বাংলা", roman: "Bengali" },
  mr: { native: "मराठी", roman: "Marathi" },
  kn: { native: "ಕನ್ನಡ", roman: "Kannada" },
  gu: { native: "ગુજરાતી", roman: "Gujarati" },
  pa: { native: "ਪੰਜਾਬੀ", roman: "Punjabi" },
  or: { native: "ଓଡ଼ିଆ", roman: "Odia" },
  ml: { native: "മലയാളം", roman: "Malayalam" },
  ur: { native: "اردو", roman: "Urdu" },
  en: { native: "English", roman: "English" },
  ar: { native: "العربية", roman: "Arabic" },
  fr: { native: "Français", roman: "French" },
  es: { native: "Español", roman: "Spanish" },
  zh: { native: "中文", roman: "Chinese" },
  sw: { native: "Kiswahili", roman: "Swahili" },
};

function LangTile({ lang, selected, onClick }: { lang: Lang; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`lang-tile${selected ? " selected" : ""}`}
      style={{ background: `linear-gradient(160deg, ${COLORS[lang]}, ${COLORS[lang]}cc)` }}
      onClick={onClick}
      aria-pressed={selected}
    >
      {selected && <IconCheck className="lang-tile__check" size={18} />}
      <span className="font-display lang-tile__native">{LABELS[lang].native}</span>
      <span className="lang-tile__roman">{LABELS[lang].roman}</span>
    </button>
  );
}

/** Full grid picker, for onboarding / bottom sheet. Netflix/Hotstar-style colorful tiles. */
export function LanguageGrid({ onDone }: { onDone?: () => void }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const pick = (l: Lang) => { setLang(l); onDone?.(); };
  return (
    <div className="lang-grid">
      {INDIAN.map((l) => (
        <LangTile key={l} lang={l} selected={lang === l} onClick={() => pick(l)} />
      ))}
      <div className="lang-divider">International</div>
      {INTL.map((l) => (
        <LangTile key={l} lang={l} selected={lang === l} onClick={() => pick(l)} />
      ))}
    </div>
  );
}

/** Compact globe icon → opens the grid in a bottom sheet. Used in TopBar. */
export function LanguageSelect() {
  const [open, setOpen] = useState(false);
  const lang = useLangStore((s) => s.lang);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <IconButton icon={<IconWorld />} variant="ghost" aria-label="Change language" />
      </SheetTrigger>
      <SheetContent side="bottom" className="lang-sheet">
        <SheetTitle>Language / {LABELS[lang].native}</SheetTitle>
        <div className="lang-sheet__scroll">
          <LanguageGrid onDone={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { SUPPORTED_LANGS } from "../../stores/langStore";
