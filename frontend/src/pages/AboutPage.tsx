import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@devalok/shilp-sutra/ui/table";
import { IconCheck } from "@tabler/icons-react";

const GITHUB_URL = "https://github.com/bastitva0-blip/AstitvaWeatherGPT";

const COVERAGE: string[] = [
  "Multilingual NLP query pipeline, ask in any of 17 languages, get an answer in the same language",
  "Live weather via OpenWeatherMap + Open-Meteo GFS, 7-16 day forecast",
  "Real-time AQI (PM2.5/PM10/CO/NO2/O3) via OWM Air Pollution API",
  "Cyclone & flood alerts from GDACS, full-screen interrupt within 500km",
  "Fishing-zone safety advisories from INCOIS",
  "Crop-specific agro advisories against IMD/ICAR thresholds",
  "Aviation METAR briefings for Indian ICAO codes",
  "30+ year climate trend charts with CSV export",
  "Threshold-based alert subscriptions + push notifications",
  "Voice input/output, on-device speech recognition with server fallback",
  "Offline-capable PWA with cached last-known weather",
  "MCP server exposing 7 tools for any AI agent",
  "Per-user API keys + live developer console",
  "Admin analytics: query volume, intent distribution, hallucination log",
];

const SOURCES: [string, string][] = [
  ["IMD, India Meteorological Dept", "Official warnings, district forecasts, heatwave alerts"],
  ["INCOIS", "Fishing zone safety, ocean state, coastal advisories"],
  ["GDACS (UN OCHA/EC)", "Live cyclone (TC) and flood (FL) alerts, Orange/Red severity, 500km radius"],
  ["OpenWeatherMap", "Real-time conditions, AQI, PM2.5/PM10/CO/NO2/O3"],
  ["Open-Meteo / GFS", "7-16 day NWP forecast, wave height (marine model)"],
  ["Open-Meteo Historical", "Climate trend archive (archive-api.open-meteo.com)"],
  ["aviationweather.gov", "Live METAR, QNH, flight category for all ICAO codes"],
  ["WIS2.0 / MQTT", "IMD real-time observation stream via globalbroker.meteo.fr"],
];

const LANGUAGES: [string, string][] = [
  ["Hindi", "देवनागरी"], ["Tamil", "தமிழ்"], ["Telugu", "తెలుగు"], ["Bengali", "বাংলা"],
  ["Marathi", "मराठी"], ["Kannada", "ಕನ್ನಡ"], ["Gujarati", "ગુજરાતી"], ["Punjabi", "ਪੰਜਾਬੀ"],
  ["Odia", "ଓଡ଼ିଆ"], ["Malayalam", "മലയാളം"], ["Urdu", "اردو"], ["English", "Latin"],
  ["Arabic", "العربية"], ["French", "Latin"], ["Spanish", "Latin"], ["Chinese (Simplified)", "汉字"], ["Swahili", "Latin"],
];

export function AboutPage() {
  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="About Sanket" />
      <p style={{ color: "var(--text-muted)" }}>
        Sanket exists to close the gap between official IMD forecasts and the people who need
        them most urgently, fishermen deciding whether to cast their nets, farmers timing
        irrigation, pilots checking a METAR before takeoff. Built for SIH26068.
      </p>

      <h2>SIH26068, problem statement coverage</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
        {COVERAGE.map((c) => (
          <li key={c} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <IconCheck size={16} style={{ color: "var(--safe)", flexShrink: 0, marginTop: 2 }} /> {c}
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: "1.5rem" }}>Data sources</h2>
      <Table>
        <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Provides</TableHead></TableRow></TableHeader>
        <TableBody>{SOURCES.map(([s, d]) => <TableRow key={s}><TableCell>{s}</TableCell><TableCell>{d}</TableCell></TableRow>)}</TableBody>
      </Table>

      <h2 style={{ marginTop: "1.5rem" }}>How citations work</h2>
      <p style={{ color: "var(--text-muted)" }}>Every QueryResponse includes a citations array, each source linked to where the data came from.</p>

      <h2 style={{ marginTop: "1.5rem" }}>Languages</h2>
      <Table density="compact">
        <TableHeader><TableRow><TableHead>Language</TableHead><TableHead>Script</TableHead><TableHead>Voice</TableHead></TableRow></TableHeader>
        <TableBody>{LANGUAGES.map(([l, s]) => <TableRow key={l}><TableCell>{l}</TableCell><TableCell>{s}</TableCell><TableCell>✓</TableCell></TableRow>)}</TableBody>
      </Table>

      <h2 style={{ marginTop: "1.5rem" }}>Open source</h2>
      <p>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a> ·{" "}
        <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT License</a>
      </p>
      <p style={{ color: "var(--text-muted)" }}>Built by Team Eloquence · SIH 2026 · <a href="/team">About the Team ↗</a></p>
      <p><a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">Report a bug on GitHub Issues</a></p>
    </div>
  );
}
