import { useState } from "react";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconWorld } from "@tabler/icons-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@devalok/shilp-sutra/ui/sheet";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { useLangStore, type Lang } from "../../stores/langStore";

const INDIAN: Lang[] = ["hi", "ta", "te", "bn", "mr", "kn", "gu", "pa", "or", "ml", "ur", "en"];
const INTL: Lang[] = ["ar", "fr", "es", "zh", "sw"];

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

/** Full grid picker — for onboarding / bottom sheet. */
export function LanguageGrid({ onDone }: { onDone?: () => void }) {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const pick = (l: Lang) => { setLang(l); onDone?.(); };
  return (
    <div className="lang-grid">
      {INDIAN.map((l) => (
        <Button key={l} variant={lang === l ? "soft" : "outline"} color={lang === l ? "accent" : "neutral"} onClick={() => pick(l)} style={{ flexDirection: "column", height: "auto", padding: "0.75rem" }}>
          <span className="font-display" style={{ fontSize: "1.1rem" }}>{LABELS[l].native}</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{LABELS[l].roman}</span>
        </Button>
      ))}
      <div className="lang-divider">International</div>
      {INTL.map((l) => (
        <Button key={l} variant={lang === l ? "soft" : "outline"} color={lang === l ? "accent" : "neutral"} onClick={() => pick(l)} style={{ flexDirection: "column", height: "auto", padding: "0.75rem" }}>
          <span className="font-display" style={{ fontSize: "1.1rem" }}>{LABELS[l].native}</span>
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{LABELS[l].roman}</span>
        </Button>
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
      <SheetContent side="bottom">
        <SheetTitle>Language / {LABELS[lang].native}</SheetTitle>
        <LanguageGrid onDone={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export { SUPPORTED_LANGS } from "../../stores/langStore";
