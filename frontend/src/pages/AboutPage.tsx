import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@devalok/shilp-sutra/ui/table";

const SOURCES: [string, string][] = [
  ["IMD — India Meteorological Dept", "Official warnings, district forecasts, heatwave alerts"],
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
      <PageHeader title="About WeatherGPT" />
      <p style={{ color: "var(--text-muted)" }}>
        WeatherGPT exists to close the gap between official IMD forecasts and the people who need
        them most urgently — fishermen deciding whether to cast their nets, farmers timing
        irrigation, pilots checking a METAR before takeoff. Built for SIH26068.
      </p>

      <h2>Data sources</h2>
      <Table>
        <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Provides</TableHead></TableRow></TableHeader>
        <TableBody>{SOURCES.map(([s, d]) => <TableRow key={s}><TableCell>{s}</TableCell><TableCell>{d}</TableCell></TableRow>)}</TableBody>
      </Table>

      <h2 style={{ marginTop: "1.5rem" }}>How citations work</h2>
      <p style={{ color: "var(--text-muted)" }}>Every QueryResponse includes a citations array — each source linked to where the data came from.</p>

      <h2 style={{ marginTop: "1.5rem" }}>Languages</h2>
      <Table density="compact">
        <TableHeader><TableRow><TableHead>Language</TableHead><TableHead>Script</TableHead><TableHead>Voice</TableHead></TableRow></TableHeader>
        <TableBody>{LANGUAGES.map(([l, s]) => <TableRow key={l}><TableCell>{l}</TableCell><TableCell>{s}</TableCell><TableCell>✓</TableCell></TableRow>)}</TableBody>
      </Table>

      <h2 style={{ marginTop: "1.5rem" }}>Open source</h2>
      <p><a href="#" target="_blank" rel="noreferrer">GitHub</a> · MIT License</p>
      <p style={{ color: "var(--text-muted)" }}>Built by Astitva Bhardwaj · SIH 2026</p>
      <p><a href="#" target="_blank" rel="noreferrer">Report a bug on GitHub Issues</a></p>
    </div>
  );
}
