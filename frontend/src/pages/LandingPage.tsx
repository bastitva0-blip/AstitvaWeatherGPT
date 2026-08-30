import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { IconButton } from "@devalok/shilp-sutra/ui/icon-button";
import { IconMenu2, IconX, IconCheck } from "@tabler/icons-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@devalok/shilp-sutra/ui/table";

const GITHUB_URL = "https://github.com/bastitva0-blip/AstitvaWeatherGPT";
const DOCS_URL = "https://backend-production-c6aa1.up.railway.app/docs";

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

const COVERAGE: string[] = [
  "Multilingual NLP query pipeline, ask in any of 17 languages, get an answer in the same language",
  "Live weather via OpenWeatherMap + Open-Meteo GFS, 7-16 day forecast",
  "Real-time AQI (PM2.5/PM10/CO/NO2/O3) via OWM Air Pollution API",
  "Cyclone & flood alerts from GDACS, full-screen interrupt within 500km",
  "Fishing-zone safety advisories from INCOIS, \"Do Not Go To Sea\" banner",
  "Crop-specific agro advisories against IMD/ICAR thresholds",
  "Aviation METAR briefings for Indian ICAO codes",
  "30+ year climate trend charts with CSV export",
  "Threshold-based alert subscriptions + push notifications (even app closed)",
  "Voice input/output, on-device speech recognition with server fallback",
  "Offline-capable PWA with cached last-known weather",
  "Every answer cites its source, zero-hallucination by design",
  "MCP server exposing 7 tools for any AI agent (Claude, Gemini, GPT, Cursor)",
  "Per-user API keys + live developer console with real request try-it",
  "Admin analytics: query volume, intent distribution, hallucination log",
];

export function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-nav__brand">🌩 Sanket</span>
        <div className="landing-nav__links">
          <a href="#features">Features</a>
          <a href="#map">Map</a>
          <a href="#api">API</a>
          <a href="#coverage">Coverage</a>
          <Button onClick={() => navigate("/team")} variant="ghost">Team</Button>
          <Button onClick={() => navigate("/auth")} shape="pill">Try Free</Button>
        </div>
        <IconButton icon={<IconMenu2 />} variant="ghost" className="landing-nav__hamburger" aria-label="Menu" onClick={() => setMenuOpen(true)} />
      </nav>

      {menuOpen && (
        <div className="mobile-overlay">
          <IconButton icon={<IconX />} variant="ghost" aria-label="Close" onClick={() => setMenuOpen(false)} />
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#map" onClick={() => setMenuOpen(false)}>Screens</a>
            <a href="#api" onClick={() => setMenuOpen(false)}>For Developers</a>
            <a href="#coverage" onClick={() => setMenuOpen(false)}>Coverage</a>
            <a onClick={() => { setMenuOpen(false); navigate("/team"); }}>Team</a>
          </div>
          <div style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", right: "1.5rem", display: "flex", gap: "1rem" }}>
            <Button variant="outline" fullWidth onClick={() => navigate("/auth")}>Sign in</Button>
            <Button fullWidth onClick={() => navigate("/auth")}>Try Free</Button>
          </div>
        </div>
      )}

      <section className="hero">
        <div className="radar-container"><div className="radar-rings" /><div className="radar-sweep" /></div>
        <div className="hero-eyebrow">India's weather intelligence</div>
        <h1 className="hero-headline">Weather for farmers.<br />Fishermen. Pilots. All of India.</h1>
        <p className="hero-sub">Real-time forecasts, cyclone alerts, fishing advisories, AQI, and climate trends, in your language, for your district.</p>
        <div className="hero-ctas">
          <Button shape="pill" size="lg" onClick={() => navigate("/auth")}>Start for free →</Button>
          <Button variant="outline" shape="pill" size="lg" onClick={() => document.querySelector(".preview-card")?.scrollIntoView({ behavior: "smooth" })}>Watch demo</Button>
        </div>
        <p className="hero-caption">Free · Open source · 17 languages · SIH 2026</p>
      </section>

      <div className="preview-card fadeUp">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-elevated)", borderRadius: "var(--radius-pill)", padding: "0.6rem 1rem" }}>
          <span>Will it rain in Patna tomorrow?</span> <span>🎤</span>
        </div>
        <div className="preview-card__chips">
          {["Cyclone alert?", "Safe to fish today?", "AQI near me", "7-day forecast"].map((c) => <Badge key={c} variant="soft" color="accent">{c}</Badge>)}
        </div>
        <div className="preview-card__minis">
          <div className="preview-mini preview-mini--danger">⚠ Cyclone Warning<br /><small>Odisha Coast · GDACS Orange Alert</small></div>
          <div className="preview-mini preview-mini--safe">Today's Outlook<br /><small>Mumbai · 31°C · Partly Cloudy</small></div>
        </div>
      </div>

      <section className="section" id="features">
        <div className="section-eyebrow">Why we built this</div>
        <h2 className="section-headline">India's weather, for the people who actually live with it.</h2>
        <p className="section-body">IMD forecasts exist. But reaching a fisherman in Odisha with a fishing-zone safety advisory in Odia, at 4am, before he casts his nets, that gap is what Sanket fills. Every answer cites its source. Nothing is made up.</p>
        <div className="feature-grid">
          <div className="feature-cell"><strong>Speaks your language</strong><p>12 Indian languages, Hindi to Odia. Plus Arabic, French, Spanish, Chinese, and Swahili for international users and India's global partners.</p></div>
          <div className="feature-cell"><strong>Knows your use case</strong><p>Farmer, fisherman, pilot, city planner. The answer changes based on who's asking.</p></div>
          <div className="feature-cell"><strong>Zero hallucination promise</strong><p>Every answer cites its data source: IMD, INCOIS, OWM, GFS, GDACS, aviationweather.gov.</p></div>
          <div className="feature-cell"><strong>Built for rural connectivity</strong><p>PWA with offline cache. SMS fallback planned. Works on a 2G connection.</p></div>
        </div>
      </section>

      <section className="section">
        <div className="section-eyebrow">A day with Sanket</div>
        <h2 className="section-headline">Open the app before you cast your nets.</h2>
        <div className="timeline">
          {[
            ["5:30 AM", '"Is it safe to go to sea today?"', "Safe/Unsafe badge, wave height 1.2m, wind ESE Force 2, INCOIS"],
            ["8:00 AM", '"Will it rain on my wheat crop this week?"', "7-day rainfall forecast, irrigation not needed, OWM + IMD"],
            ["2:00 PM", '"AQI near my factory in Surat?"', "AQI 89 Moderate, PM2.5 breakdown, OWM Air Pollution API"],
            ["6:00 PM", '"Cyclone warning in my district?"', "Full-screen red alert, GDACS Orange, 340km away"],
            ["Anytime", "Ask in Tamil. Get the answer in Tamil.", "Voice input, multilingual"],
          ].map(([time, q, a]) => (
            <div key={time} className="timeline-item">
              <div className="timeline-item__time">{time}</div>
              <div>{q}</div>
              <div style={{ color: "var(--text-muted)" }}>{a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="map">
        <div className="section-eyebrow">What's inside</div>
        <h2 className="section-headline">More than a forecast.</h2>
        <div className="screen-grid">
          {[
            ["💬", "Chat", "AI weather chat, voice input, 12+ languages, source citations"],
            ["🗺", "Map", "Rainfall radar, cyclone tracks, coastal zones, AQI overlay"],
            ["📍", "Cities", "Save up to 5 locations, live conditions at a glance"],
            ["⚖", "Compare", "Side-by-side weather for traders, logistics, field teams"],
            ["📈", "Climate", "30+ year trends. Download as CSV."],
            ["🔔", "Alerts", "Subscribe by threshold. Push even when app is closed."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="screen-card">
              <div className="screen-card__icon">{icon}</div>
              <strong>{title}</strong>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ borderLeft: "3px solid var(--teal)", background: "var(--bg-surface)", maxWidth: "100%" }}>
        <h2 className="section-headline">When it matters most, you can't miss it.</h2>
        <p className="section-body">Sanket pulls live cyclone and flood data from GDACS (UN OCHA/EC), updated from NOAA/JTWC. When an Orange or Red alert is within 500km of your location, you get a full-screen interrupt. For fishermen: a "DO NOT GO TO SEA" banner that cannot be dismissed without reading it.</p>
      </section>

      <section className="section" id="api">
        <div className="section-eyebrow">For AI builders</div>
        <h2 className="section-headline">Plug Indian weather into any AI agent or LLM.</h2>
        <p className="section-body">Sanket exposes an MCP server with 7 real weather tools. Connect to Claude, Gemini, GPT-4o, or any MCP-compatible agent.</p>
        <div className="dev-cols">
          <div className="code-block">{`{
  "mcpServers": {
    "sanket": {
      "command": "npx",
      "args": ["-y", "@sanket/mcp-server"],
      "env": { "SANKET_API_KEY": "your-key" }
    }
  }
}`}</div>
          <div className="code-block">{`from sanket_sdk import Sanket
wg = Sanket(api_key="your-key")
result = wg.ask("क्या आज मछली पकड़ना सुरक्षित है?")
print(result.answer)
print(result.alert_level)`}</div>
        </div>
        <div className="tool-chips">
          {["ask_weather", "get_live_weather", "get_aqi", "get_agro_advisory", "get_metar", "get_climate_trend", "subscribe_alert"].map((t) => (
            <Badge key={t} variant="soft" color="accent" className="mono">{t}</Badge>
          ))}
        </div>
        <div className="hero-ctas">
          <Button shape="pill" onClick={() => navigate("/auth")}>Get API key</Button>
          <Button variant="outline" shape="pill" onClick={() => window.open(DOCS_URL, "_blank", "noopener,noreferrer")}>MCP Docs</Button>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Free tier · 60 req/min · Open source · No credit card</p>
      </section>

      <section className="section" id="coverage">
        <div className="section-eyebrow">SIH26068, problem statement coverage</div>
        <h2 className="section-headline">Every requirement, and more.</h2>
        <ul className="coverage-list">
          {COVERAGE.map((c) => (
            <li key={c}><IconCheck size={16} className="coverage-list__check" /><span>{c}</span></li>
          ))}
        </ul>
        <h3 style={{ marginTop: "2rem" }}>Zero hallucinations, every answer has a source</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Provides</TableHead></TableRow></TableHeader>
          <TableBody>{SOURCES.map(([s, d]) => <TableRow key={s}><TableCell>{s}</TableCell><TableCell>{d}</TableCell></TableRow>)}</TableBody>
        </Table>
      </section>

      <section className="footer-cta">
        <h2 className="section-headline">Weather that works for India.</h2>
        <p style={{ color: "var(--text-muted)" }}>Free to use. Open source. Built for SIH 2026.</p>
        <Button shape="pill" size="lg" onClick={() => navigate("/auth")}>Try Sanket Free</Button>
        <div className="footer-links">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">API Docs</a>
          <a onClick={() => navigate("/team")}>About the Team</a>
          <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">License</a>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>© 2026 Team Eloquence · Sanket · SIH26068</p>
      </section>
    </div>
  );
}
