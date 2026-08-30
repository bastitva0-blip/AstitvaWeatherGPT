import { useEffect, useState } from "react";
import { sendQuery, fetchLiveWeather } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { PageHeader } from "@devalok/shilp-sutra/composed/page-header";
import { Card, CardContent } from "@devalok/shilp-sutra/ui/card";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Badge } from "@devalok/shilp-sutra/ui/badge";
import { Input } from "@devalok/shilp-sutra/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@devalok/shilp-sutra/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@devalok/shilp-sutra/ui/accordion";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@devalok/shilp-sutra/ui/table";
import { toast } from "@devalok/shilp-sutra/ui/toast";

const TABS = ["Claude Desktop", "Cursor / Windsurf", "Gemini", "OpenAI"] as const;

const TOOLS = [
  { name: "ask_weather", desc: "Natural-language weather query in any of 17 languages. Full NLP pipeline: language detection → intent classification → geocoding → multi-source fetch → LLM answer.", route: "POST /api/query" },
  { name: "get_live_weather", desc: "Raw structured weather data. No NLP, direct fetch from OpenWeatherMap + Open-Meteo GFS.", route: "GET /api/weather/live" },
  { name: "get_aqi", desc: "Real-time AQI via OWM Air Pollution API. Scale 1-5.", route: "GET /api/aqi" },
  { name: "get_agro_advisory", desc: "Crop-specific advisory using IMD/ICAR thresholds.", route: "GET /api/agro" },
  { name: "get_metar", desc: "Live METAR from aviationweather.gov for Indian ICAO codes.", route: "GET /api/metar" },
  { name: "get_climate_trend", desc: "Historical climate trend from Open-Meteo archive.", route: "GET /api/climate/trend" },
  { name: "subscribe_alert", desc: "Subscribe a location to threshold-triggered alerts.", route: "POST /api/alert/subscribe" },
];

function CopyBtn({ text }: { text: string }) {
  return (
    <div className="code-block__copy">
      <Button
        variant="outline" size="compact-sm"
        onClick={() => { navigator.clipboard.writeText(text); toast("Copied ✓"); }}
      >
        Copy
      </Button>
    </div>
  );
}

export function DeveloperPage() {
  const [showKey, setShowKey] = useState(false);
  const [tool, setTool] = useState("ask_weather");
  const [tryMessage, setTryMessage] = useState("Will it rain in Kolkata?");
  const [tryResult, setTryResult] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(() => sessionStorage.getItem("wgpt_dev_key"));
  const userEmail = useAuthStore((s) => s.userEmail);
  const userName = useAuthStore((s) => s.userName);

  useEffect(() => {
    if (apiKey || !userEmail) return;
    const base = import.meta.env.VITE_API_BASE || "";
    fetch(`${base}/api/dev/key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, name: userName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.api_key) {
          sessionStorage.setItem("wgpt_dev_key", data.api_key);
          setApiKey(data.api_key);
        }
      })
      .catch(() => {});
  }, [apiKey, userEmail, userName]);

  async function runTool() {
    const t0 = performance.now();
    try {
      const res = tool === "ask_weather" ? await sendQuery(tryMessage, crypto.randomUUID()) : await fetchLiveWeather(tryMessage);
      setTryResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setTryResult(String(e));
    } finally {
      setLatency(performance.now() - t0);
    }
  }

  const keyPlaceholder = apiKey ?? "…";
  const CONFIGS: Record<string, string> = {
    "Claude Desktop": `{
  "mcpServers": {
    "sanket": {
      "command": "npx",
      "args": ["-y", "@sanket/mcp-server"],
      "env": { "SANKET_API_KEY": "${keyPlaceholder}" }
    }
  }
}`,
    "Cursor / Windsurf": `{ "mcp.servers": { "sanket": { "url": "https://api.sanket.in/mcp", "headers": { "X-API-Key": "${keyPlaceholder}" } } } }`,
    "Gemini": `gemini mcp add sanket --url https://api.sanket.in/mcp --header "X-API-Key: ${keyPlaceholder}"`,
    "OpenAI": `# Add as a custom tool endpoint\nMCP SSE URL: https://api.sanket.in/mcp\nAuth header: X-API-Key: ${keyPlaceholder}`,
  };

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader title="Developer" />

      <Card variant="outline" style={{ borderLeftWidth: 3, borderLeftColor: "var(--color-accent-9)" }}>
        <CardContent>
          <p style={{ fontWeight: 600 }}>Your API Key</p>
          <p className="mono">{apiKey ? (showKey ? apiKey : "●".repeat(16)) : "Sign in to generate a key…"}</p>
          <Button variant="outline" size="sm" disabled={!apiKey} onClick={() => { setShowKey(true); setTimeout(() => setShowKey(false), 5000); }}>Show 5s</Button>
          <Button variant="outline" size="sm" disabled={!apiKey} onClick={() => { if (apiKey) { navigator.clipboard.writeText(apiKey); toast("Copied ✓"); } }}>Copy</Button>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Requests today: 847 / 1000 · Rate limit: 60 req/min</p>
          <Button variant="ghost" color="error" disabled={!apiKey}>Regenerate key</Button>
        </CardContent>
      </Card>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>MCP Setup</h2>
        <Tabs defaultValue={TABS[0]}>
          <TabsList>
            {TABS.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
          </TabsList>
          {TABS.map((t) => (
            <TabsContent key={t} value={t}>
              <div className="code-block">
                <CopyBtn text={CONFIGS[t]} />
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{CONFIGS[t]}</pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Tool Reference</h2>
        <Accordion type="single" collapsible>
          {TOOLS.map((t) => (
            <AccordionItem key={t.name} value={t.name}>
              <AccordionTrigger className="mono">{t.name}</AccordionTrigger>
              <AccordionContent>
                <p>{t.desc}</p>
                <p className="mono" style={{ fontSize: "0.8rem" }}>{t.route}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Live Try-It</h2>
        <select value={tool} onChange={(e) => setTool(e.target.value)} style={{ padding: "0.4rem" }}>
          {TOOLS.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
        <Input value={tryMessage} onChange={(e) => setTryMessage(e.target.value)} style={{ width: "100%", margin: "0.5rem 0" }} />
        <Button onClick={runTool}>▶ Run</Button>
        {tryResult && (
          <div className="code-block" style={{ marginTop: "0.75rem" }}>
            {latency != null && <p style={{ color: "var(--text-muted)" }}>Response ({(latency / 1000).toFixed(2)}s):</p>}
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{tryResult}</pre>
          </div>
        )}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Rate Limits</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Tier</TableHead><TableHead>Rate</TableHead><TableHead>Cost</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell>Free</TableCell><TableCell>60 req/min · 1000 req/day</TableCell><TableCell>Free forever</TableCell></TableRow>
            <TableRow><TableCell>MCP (AI agents)</TableCell><TableCell>Same free tier</TableCell><TableCell>Free</TableCell></TableRow>
            <TableRow><TableCell>Pro (coming soon)</TableCell><TableCell>300 req/min · unlimited</TableCell><TableCell>TBD</TableCell></TableRow>
          </TableBody>
        </Table>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>SDKs</h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {["Python SDK", "Node.js SDK", "MCP npm package"].map((s) => (
            <Card key={s} variant="default"><CardContent>{s} <Badge color="neutral" variant="soft">Coming soon</Badge></CardContent></Card>
          ))}
        </div>
      </section>
    </div>
  );
}
