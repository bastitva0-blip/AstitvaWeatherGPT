<div align="center">

<br/>

# 🌦️ Sanket

### India's AI Weather Assistant — Conversational, Multilingual, Zero Hallucination

<p align="center">
  <img src="https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange?style=for-the-badge&logo=india" alt="SIH 2026"/>
  <img src="https://img.shields.io/badge/PS-SIH26068-blue?style=for-the-badge" alt="Problem Statement"/>
  <img src="https://img.shields.io/badge/Ministry%20of%20Earth%20Sciences-IMD-green?style=for-the-badge" alt="MoES IMD"/>
  <img src="https://img.shields.io/badge/Team-Eloquence-purple?style=for-the-badge" alt="Team Eloquence"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/NVIDIA%20NIM-Llama%203.2%2011B-76B900?style=flat-square&logo=nvidia&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-Manifests-326CE5?style=flat-square&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/MCP-7%20Tools-black?style=flat-square" />
  <img src="https://img.shields.io/badge/Languages-17-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

<p align="center">
  <a href="https://frontend-production-9606.up.railway.app"><strong>🌐 Live App</strong></a> ·
  <a href="https://backend-production-c6aa1.up.railway.app/docs"><strong>📖 API Docs</strong></a> ·
  <a href="https://backend-production-c6aa1.up.railway.app/health"><strong>💚 Health Check</strong></a>
</p>

<br/>

> **Sanket** is a production-grade, AI-powered weather intelligence platform built for the Indian Ministry of Earth Sciences (PS SIH26068).  
> Ask anything in **17 languages**. Get a grounded, cited answer — backed by real data from IMD, GFS, GDACS, and OWM.  
> The LLM writes words. The code owns the facts. **Zero hallucination by design.**

<br/>

</div>

---

## 📚 Table of Contents

- [✨ Feature Matrix](#-feature-matrix)
- [🏗️ System Architecture](#️-system-architecture)
- [🧠 AI & NLP Pipeline](#-ai--nlp-pipeline)
- [🔌 MCP Server](#-mcp-server--ai-agent-integration)
- [🗂️ Project Structure](#️-project-structure)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Variables](#️-environment-variables)
- [🌐 Frontend Pages & Routes](#-frontend-pages--routes)
- [📡 API Reference](#-api-reference)
- [🗄️ Database Schema](#️-database-schema)
- [🌍 Multilingual Support](#-multilingual-support)
- [🌾 Sector-Specific Features](#-sector-specific-features)
- [🛰️ Data Sources](#️-data-sources)
- [☁️ Deployment](#️-deployment)
- [📊 Monitoring](#-monitoring)
- [🧪 Testing](#-testing)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [🗺️ Roadmap](#️-roadmap)
- [👥 Team](#-team)
- [📄 License](#-license)

---

## ✨ Feature Matrix

<table>
<thead>
<tr><th>Category</th><th>Feature</th><th>Status</th><th>Data Source</th></tr>
</thead>
<tbody>
<tr>
  <td rowspan="4"><strong>🌦️ Weather</strong></td>
  <td>Real-time weather (temperature, humidity, wind, visibility, rainfall)</td>
  <td>✅ Live</td><td>OpenWeatherMap</td>
</tr>
<tr>
  <td>GFS Numerical Weather Prediction via Open-Meteo</td>
  <td>✅ Live</td><td>NOAA GFS / Open-Meteo</td>
</tr>
<tr>
  <td>Marine wave height (real ocean model data)</td>
  <td>✅ Live — never synthetic</td><td>Open-Meteo Marine</td>
</tr>
<tr>
  <td>Fisherman SAFE / UNSAFE sea verdict (wave >2.5m AND wind >45 km/h)</td>
  <td>✅ Live</td><td>Computed from real data</td>
</tr>
<tr>
  <td rowspan="2"><strong>🚨 Alerts</strong></td>
  <td>Cyclone warnings — current TC events within 500km (Orange/Red only)</td>
  <td>✅ Live</td><td>GDACS (UN OCHA/EC)</td>
</tr>
<tr>
  <td>Flood warnings — FL events within 500km (Orange/Red only)</td>
  <td>✅ Live</td><td>GDACS (UN OCHA/EC)</td>
</tr>
<tr>
  <td rowspan="3"><strong>🤖 AI</strong></td>
  <td>Natural language query understanding in 17 languages</td>
  <td>✅ Live</td><td>Keyword classifier + NVIDIA NIM</td>
</tr>
<tr>
  <td>Grounded LLM answer (facts from real APIs, never the model's memory)</td>
  <td>✅ Live</td><td>NVIDIA NIM — Llama 3.2 11B</td>
</tr>
<tr>
  <td>RAG context retrieval over IMD bulletins corpus</td>
  <td>✅ Live (ChromaDB optional)</td><td>ChromaDB</td>
</tr>
<tr>
  <td rowspan="3"><strong>🌾 Sector</strong></td>
  <td>Agro-advisory — 8 crops with IMD/ICAR heat, frost, water-need thresholds</td>
  <td>✅ Live</td><td>IMD/ICAR rules</td>
</tr>
<tr>
  <td>Aviation briefing — METAR, QNH, flight category (VFR/IFR/MVFR/LIFR)</td>
  <td>✅ Live</td><td>aviationweather.gov</td>
</tr>
<tr>
  <td>AQI — PM2.5, PM10, CO, NO₂, O₃ on OWM 1–5 index</td>
  <td>✅ Live</td><td>OWM Air Pollution API</td>
</tr>
<tr>
  <td rowspan="2"><strong>📈 Climate</strong></td>
  <td>Historical climate trend with scipy linear regression (change/decade)</td>
  <td>✅ Live</td><td>Open-Meteo Archive / DB</td>
</tr>
<tr>
  <td>ClimateRecord DB table (curated verified data takes priority over archive)</td>
  <td>✅ Live</td><td>PostgreSQL</td>
</tr>
<tr>
  <td rowspan="3"><strong>🗺️ GIS</strong></td>
  <td>Nominatim geocoding — global-first, India-biased fallback, OWM geo 3rd</td>
  <td>✅ Live</td><td>OpenStreetMap / OWM</td>
</tr>
<tr>
  <td>Custom geohash (pure Python) — prefix-search for nearby locations</td>
  <td>✅ Live</td><td>LocationCache (Postgres)</td>
</tr>
<tr>
  <td>Indian coastal zone lookup via GeoJSON + Shapely point-in-polygon</td>
  <td>✅ Live</td><td>Custom GeoJSON</td>
</tr>
<tr>
  <td rowspan="2"><strong>🎙️ Voice</strong></td>
  <td>Web Speech API (on-device, streams interim results) — primary path</td>
  <td>✅ Live</td><td>Browser native</td>
</tr>
<tr>
  <td>faster-whisper CTranslate2 transcription — fallback for Firefox/Safari</td>
  <td>✅ Live</td><td>faster-whisper 1.0.3</td>
</tr>
<tr>
  <td rowspan="3"><strong>📱 PWA</strong></td>
  <td>Installable PWA with 8 icon sizes (72px–512px)</td>
  <td>✅ Live</td><td>Vite PWA / sw.js</td>
</tr>
<tr>
  <td>Offline banner (useOnlineStatus hook)</td>
  <td>✅ Live</td><td>Navigator.onLine</td>
</tr>
<tr>
  <td>Web Push notifications + backend /api/push/subscribe</td>
  <td>✅ Live</td><td>PushSubscription DB table</td>
</tr>
<tr>
  <td rowspan="2"><strong>🔌 MCP</strong></td>
  <td>7 tools exposed as MCP server (@sanket/mcp-server)</td>
  <td>✅ Live</td><td>Claude Desktop / Cursor / Gemini / OpenAI</td>
</tr>
<tr>
  <td>Per-user API key auto-generated via /api/dev/key (Firebase email)</td>
  <td>✅ Live</td><td>Developer page</td>
</tr>
<tr>
  <td rowspan="2"><strong>🛰️ WIS2.0</strong></td>
  <td>WMO WIS2.0 MQTT subscriber (paho-mqtt/TLS, globalbroker.meteo.fr)</td>
  <td>✅ Live (opt-in)</td><td>WMO Global Broker</td>
</tr>
<tr>
  <td>Internal Redis pub/sub mirrors WIS2.0 MQTT semantics (always active)</td>
  <td>✅ Live</td><td>Redis</td>
</tr>
<tr>
  <td rowspan="2"><strong>🔧 Platform</strong></td>
  <td>Prometheus metrics + Grafana dashboard</td>
  <td>✅ Live</td><td>prometheus-fastapi-instrumentator</td>
</tr>
<tr>
  <td>Per-user admin dashboard (query history, intent distribution)</td>
  <td>✅ Live</td><td>PostgreSQL</td>
</tr>
</tbody>
</table>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│  React 18 + TypeScript + Vite  →  PWA (installable, offline-ready)     │
│  @devalok/shilp-sutra design system · Tailwind CSS v4 · Framer Motion  │
│  Leaflet (Carto basemap) · i18next (17 langs) · Zustand (6 stores)     │
│  Firebase Auth (Google OAuth + email/password)                          │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  HTTPS / WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API Gateway (Nginx / Railway)                         │
│         /api/* → FastAPI:8000      /  → React:3000                     │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              FastAPI Backend  (v3.0.0 · SlowAPI 60 req/min)             │
│                                                                         │
│  POST /api/query  ─────────────────────────────────────────────────┐   │
│                                                                     │   │
│  ① nlp_pipeline (async)                                            │   │
│     ├─ detect_language()   Unicode block → langdetect              │   │
│     ├─ translate_to_english()   NVIDIA NIM (passthrough if en)     │   │
│     ├─ classify_intent()   keyword classifier (instant, no LLM)    │   │
│     ├─ extract_slots()     regex + crop aliases                    │   │
│     └─ _extract_location_llm()  LLM fallback (only if regex empty) │   │
│                                                                     │   │
│  ② asyncio.gather (parallel)                                       │   │
│     ├─ weather_service   OWM → synthetic-fallback                  │   │
│     │   └─ _fetch_marine_wave_height()   Open-Meteo Marine         │   │
│     │   └─ disaster_service.get_nearby_disasters()  GDACS          │   │
│     ├─ gfs_service        Open-Meteo GFS (or WIS2 Redis data)      │   │
│     ├─ rag_service        ChromaDB retrieve (degrades gracefully)  │   │
│     ├─ aqi_service        OWM Air Pollution  (urban intent only)   │   │
│     └─ gis_service.get_coastal_zone()   (marine intent only)       │   │
│                                                                     │   │
│  ③ llm_service.generate()   NVIDIA NIM — answer in user's lang     │   │
│     LLM writes ONE sentence. Facts come from step ②.               │   │
│     Deterministic fallback if LLM unavailable.                     │   │
│                                                                     │   │
│  ④ persist Query row → PostgreSQL                                  │   │
│     └─ return QueryResponse ←──────────────────────────────────────┘   │
│                                                                         │
│  Special routes (bypass the NLP pipeline):                             │
│  POST /api/query (aviation_briefing intent) → aviation_service (METAR) │
│  POST /api/query (climate_trend intent)     → climate_service          │
│                                                                         │
│  WS /ws/alerts  ── Redis SUBSCRIBE ── alert_service threshold checks   │
│                                                                         │
│  APScheduler · Prometheus instrumentation · unhandled-exc CORS guard   │
└──────────┬──────────────────────────────┬───────────────────────────────┘
           │                              │
    ┌──────▼──────┐              ┌────────▼──────────┐
    │ PostgreSQL  │              │     Redis 7        │
    │   (8 tables)│              │  weather:v2:*  TTL │
    │  asyncpg    │              │  gfs:v2:*     TTL  │
    │  Prisma     │              │  wis2:*       TTL  │
    │  schema     │              │  WS pub/sub        │
    └─────────────┘              └───────────────────┘
           │                              │
    ┌──────▼──────┐              ┌────────▼──────────┐
    │  ChromaDB   │              │ WIS2.0 MQTT Broker │
    │  (optional) │              │ globalbroker.      │
    │  RAG corpus │              │ meteo.fr:8883/TLS  │
    └─────────────┘              └───────────────────┘
```

### Key Design Decisions

| Decision | Why | Evidence in code |
|---|---|---|
| **LLM writes words, code owns facts** | Small instruction-tuned models on NIM are unreliable at strict JSON schemas and can invent citation URLs — splitting concerns removes both failure modes | `llm_service.py` docstring |
| **Keyword classifier for intent/slots, not LLM** | 2 extra sequential LLM calls were adding 13–15s/query on the hot path — instant classifier is already the tested fallback | `nlp_service.py` docstring |
| **LLM writes answer directly in target language** | Eliminated second back-translation call (~1.3–3s per non-English query in production) | `llm_service.py` `_answer_system_prompt()` |
| **Llama 3.2 11B over 120B reasoning model** | ~1.3s/call vs 10–15s — meets <2000ms P95 latency criterion | `config.py` NVIDIA_MODEL default |
| **Global Nominatim before India-biased** | India-first was silently resolving "Paris" to a Mumbai suburb — caught live in production | `gis_service.py` comment block |
| **Wave height is never synthetic** | This field drives the fisherman SAFE/UNSAFE verdict — `None` for inland is correct, not a gap to fill | `weather_service.py` `_fetch_marine_wave_height()` |
| **Versioned Redis cache keys (v2)** | Stale synthetic data from before real-API switch would have been served after redeploy without version bump | `weather_service.py` `cache_key = f"weather:v2:..."` |
| **CORS guard on unhandled exceptions** | FastAPI exceptions escape CORSMiddleware and cause bare "Failed to fetch" browser errors — explicit JSON+CORS header response instead | `main.py` `unhandled_exception_handler()` |

---

## 🧠 AI & NLP Pipeline

Every query flows through a deterministic, latency-optimized 8-step pipeline:

```
User message (any of 17 languages)
        │
        ▼
 1. Language Detection  (zero network calls)
    ├── Unicode block ranges: ml, ta, te, bn, hi, gu, pa, kn, or, ur, ar, zh
    └── langdetect (seeded, deterministic): fr, es, sw, en
        Fallback on detection failure → "hi" (most common non-English usage)

        │
        ▼
 2. Translation to English  (NVIDIA NIM, or passthrough in test mode)
    System: "Return ONLY the translated text"  max_tokens=300  temp=0.0
    Passthrough if: src_lang=="en" OR llm_client.is_configured()==False

        │
        ▼
 3. Intent Classification  (deterministic keyword classifier — no LLM)
    ┌───────────────────────────────────────────────────────────────────┐
    │  marine_advisory    │  aviation_briefing  │  cyclone_track        │
    │  alert_check        │  agro_advisory      │  historical_climate   │
    │  climate_trend      │  urban_monitoring   │  forecast_query       │
    │  general_weather    │  clarification_needed                       │
    └───────────────────────────────────────────────────────────────────┘
    Word-boundary regex matching (\b) prevents "wave" matching "heatwave",
    "sea" matching "season/disease" — caught real production misrouting.

        │
        ▼
 4. Slot Extraction  (regex + crop alias table — no LLM)
    location · date · date_range · crop_type · weather_parameter ·
    icao_code (VICAO regex) · fishing_zone
    Crop aliases: gehu→wheat, makka→maize, sarson→mustard, ganna→sugarcane…

        │
        ▼
 5. LLM Location Fallback  (only when regex finds nothing)
    Handles lowercase casual queries: "will it be sunny in lucknow"
    System: "Reply with ONLY the place name, properly capitalized"
    max_tokens=30  temp=0.0  — skipped on common well-capitalized queries

        │
        ▼
 6. Parallel Data Fetch  (asyncio.gather — all I/O concurrent)
    ├── weather_service.fetch_weather()
    │    ├── OWM current weather (primary)
    │    ├── Open-Meteo Marine wave height (always real, never synthetic)
    │    ├── GDACS cyclone+flood events within 500km (Haversine filter)
    │    └── SHA256-seeded synthetic fallback (if OWM unreachable)
    ├── gfs_service.fetch_gfs_forecast()
    │    ├── WIS2 Redis data (if WIS2_ENABLED and wis2:{lat}:{lon}:latest)
    │    └── Open-Meteo GFS seamless (midday T+12h value as daily repr.)
    ├── rag_service.retrieve()    ChromaDB cosine search, n=5
    ├── aqi_service.fetch_aqi()  OWM Air Pollution (urban intent only)
    └── gis_service.get_coastal_zone()  Shapely point-in-polygon (marine only)

        │
        ▼
 7. LLM Answer Generation  (NVIDIA NIM — Llama 3.2 11B)
    System: [base rules] + "Write answer in {target_lang} native script"
    User:   flat facts string from step 6 — model cannot invent numbers
    Safety rule in system prompt: use fishing_zone_safe verdict exactly;
    if None (inland) → say "not enough data", never guess SAFE/UNSAFE
    Deterministic fallback answer if LLM unavailable/fails.

        │
        ▼
 8. Response Assembly  (code — never LLM)
    answer · citations[] · weather_summary{} · alert_level · use_case_context
    Persist Query row → PostgreSQL → return QueryResponse
```

### Intent → Service Routing

| Intent | Use Case | Extra Services | Response Note |
|---|---|---|---|
| `forecast_query` | `general` | weather, gfs | Standard forecast |
| `general_weather` | `general` | weather, gfs | Same as forecast |
| `marine_advisory` | `fisherman` | weather + coastal_zone | SAFE/UNSAFE verdict |
| `agro_advisory` | `farmer` | weather + agro_service | Crop-specific advisory |
| `aviation_briefing` | `aviation` | aviation_service (METAR) | Bypasses standard weather fetch |
| `urban_monitoring` | `urban` | weather + aqi_service | PM2.5, PM10, AQI index |
| `climate_trend` | `researcher` | climate_service | Bypasses standard weather fetch |
| `alert_check` | `disaster` | weather (GDACS baked in) | Alert level surfaced |
| `cyclone_track` | `disaster` | weather (GDACS baked in) | cyclone_warning + name |

---

## 🔌 MCP Server — AI Agent Integration

Sanket exposes **7 tools** as an MCP server (`@sanket/mcp-server`), making it callable from any AI agent — Claude Desktop, Cursor, Windsurf, Gemini, OpenAI — with zero extra code.

### MCP Tool Reference

| Tool | Route | What it does |
|---|---|---|
| `ask_weather` | `POST /api/query` | Full NLP pipeline: detect language → classify intent → geocode → multi-source fetch → LLM answer in user's language |
| `get_live_weather` | `GET /api/weather/live` | Raw structured weather data (no NLP, direct OWM + GFS fetch) |
| `get_aqi` | `GET /api/aqi` | Real-time AQI: PM2.5, PM10, CO, NO₂, O₃ on OWM 1–5 index |
| `get_agro_advisory` | `GET /api/agro` | Crop-specific advisory using IMD/ICAR thresholds |
| `get_metar` | `GET /api/metar` | Live METAR from aviationweather.gov (ICAO code required) |
| `get_climate_trend` | `GET /api/climate/trend` | Historical trend with slope + change/decade from Open-Meteo archive |
| `subscribe_alert` | `POST /api/alert/subscribe` | Subscribe a location to threshold-triggered alerts |

### Setup Configs

**Claude Desktop** (`~/.claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "sanket": {
      "command": "npx",
      "args": ["-y", "@sanket/mcp-server"],
      "env": { "SANKET_API_KEY": "your-api-key" }
    }
  }
}
```

**Cursor / Windsurf**:
```json
{ "mcp.servers": { "sanket": { "url": "https://api.sanket.in/mcp", "headers": { "X-API-Key": "your-api-key" } } } }
```

**Gemini CLI**:
```bash
gemini mcp add sanket --url https://api.sanket.in/mcp --header "X-API-Key: your-api-key"
```

**Rate limits**: Free — 60 req/min, 1000 req/day. API key auto-generated on the Developer page after Firebase sign-in.

---

## 🗂️ Project Structure

```
AstitvaWeatherGPT/
│
├── 📁 backend/
│   ├── 📁 app/
│   │   ├── 📁 core/
│   │   │   ├── auth.py           # X-API-Key bearer verification
│   │   │   ├── cache.py          # Redis async connection helpers
│   │   │   └── config.py         # Pydantic settings (all env-driven)
│   │   ├── 📁 models/
│   │   │   ├── database.py       # SQLAlchemy async models (8 tables)
│   │   │   │                     # init_db() handles ALTER TABLE IF NOT EXISTS
│   │   │   │                     # for post-deploy column additions
│   │   │   └── schemas.py        # Pydantic request/response schemas
│   │   ├── 📁 routes/
│   │   │   ├── query.py          # POST /api/query — main chat endpoint
│   │   │   ├── weather.py        # GET  /api/weather
│   │   │   ├── alerts.py         # POST /api/alerts/subscribe
│   │   │   ├── admin.py          # GET  /api/admin/* (per-user scoped)
│   │   │   ├── voice.py          # POST /api/voice/transcribe
│   │   │   ├── climate.py        # GET  /api/climate/trend
│   │   │   ├── websocket.py      # WS   /ws/alerts  (Redis SUBSCRIBE)
│   │   │   └── misc.py           # POST /api/feedback, /api/dev/key,
│   │   │                         # GET /api/aqi, /api/metar, /api/agro
│   │   │                         # POST /api/push/subscribe
│   │   ├── 📁 services/
│   │   │   ├── nlp_service.py    # Language detect → translate → intent → slots
│   │   │   ├── llm_service.py    # Grounded answer generation (NVIDIA NIM)
│   │   │   ├── llm_client.py     # NVIDIA NIM via openai SDK (base_url override)
│   │   │   ├── weather_service.py# OWM + synthetic-fallback + wave height
│   │   │   ├── gfs_service.py    # Open-Meteo GFS (WIS2 Redis priority)
│   │   │   ├── disaster_service.py # GDACS TC+FL, 500km Haversine, Orange/Red only
│   │   │   ├── aqi_service.py    # OWM Air Pollution — PM2.5/PM10/CO/NO₂/O₃
│   │   │   ├── aviation_service.py # METAR from aviationweather.gov
│   │   │   ├── agro_service.py   # 8 crops × IMD/ICAR thresholds
│   │   │   ├── climate_service.py# DB → Open-Meteo archive → RAG → honest "no data"
│   │   │   ├── gis_service.py    # Nominatim (global-first) + geohash + coastal zones
│   │   │   ├── rag_service.py    # ChromaDB RAG (optional — degrades gracefully)
│   │   │   ├── alert_service.py  # Threshold checking + Redis pub/sub
│   │   │   ├── voice_service.py  # faster-whisper + stub fallback
│   │   │   └── wis2_service.py   # WIS2.0 paho-mqtt/TLS subscriber
│   │   └── main.py               # App factory, lifespan, CORS, Prometheus, WIS2 startup
│   ├── 📁 data/
│   │   └── indian_coastal_zones.geojson
│   ├── 📁 eval/
│   │   ├── ground_truth.json     # Q&A ground truth for accuracy evaluation
│   │   └── run_eval.py           # Automated accuracy eval script
│   ├── 📁 k8s/                   # Kubernetes manifests
│   ├── 📁 prisma/
│   │   └── schema.prisma         # Canonical DB schema (SQLAlchemy is runtime)
│   ├── 📁 tests/                 # pytest test suite (10 test files)
│   │   └── silence.wav           # Real WAV fixture for voice tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── railway.json
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 assets/team/       # Real team photos (6 × .jpg)
│   │   ├── 📁 components/
│   │   │   ├── Chat/             # ChatBubble, ChatInput, FeedbackButtons, SuggestionChips
│   │   │   ├── Map/              # WeatherMap, WeatherPopup, CoastalZones, LayerToggle, TimelineScrubber
│   │   │   ├── Shell/            # TopBar, Sidebar, BottomNav, OfflineBanner
│   │   │   ├── UI/               # AlertToast, ClimateTrendChart, VoiceButton, LanguageSelect
│   │   │   │                     # GlobalSearch, LocationPicker
│   │   │   └── Weather/          # WeatherHeroCard, AQICard, StatGrid, FloodBanner, CycloneFullscreen
│   │   ├── 📁 pages/             # 15 route-level pages
│   │   ├── 📁 stores/            # Zustand: auth, chat, alert, cities, feedback, lang
│   │   ├── 📁 hooks/             # useVoiceRecorder, useWebSocket, useOnlineStatus
│   │   │                         # usePushNotifications, usePWAInstall
│   │   ├── 📁 i18n/              # 17 language JSON files + index.ts
│   │   ├── 📁 lib/               # api.ts, firebase.ts, push.ts, feedback.ts, RouterLink.tsx
│   │   └── 📁 styles/            # app.css, base.css, landing.css, tokens.css
│   ├── 📁 public/
│   │   ├── 📁 icons/             # 8 icon sizes: 72/96/128/144/152/192/384/512px
│   │   ├── 📁 data/              # indian_coastal_zones.geojson (frontend copy)
│   │   ├── manifest.webmanifest  # "Sanket: India's AI Weather Assistant"
│   │   └── sw.js                 # Service worker
│   ├── Dockerfile
│   ├── vercel.json
│   ├── vite.config.ts
│   └── package.json
│
├── 📁 monitoring/
│   ├── prometheus.yml
│   └── grafana/dashboard.json
│
├── 📁 nginx/nginx.conf
├── 📁 .github/workflows/deploy.yml
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Docker + Docker Compose | v24+ |
| Node.js | ≥ 20.0.0 |
| Python | 3.11 |

### Option 1 — Docker Compose (All Services, One Command)

```bash
# 1. Clone
git clone https://github.com/your-org/AstitvaWeatherGPT.git
cd AstitvaWeatherGPT

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum: NVIDIA_API_KEY, OPENWEATHERMAP_API_KEY, API_KEYS

# 3. Start everything
docker compose up --build

# Services:
#   FastAPI backend  →  http://localhost:8000  (API docs: /docs)
#   React frontend   →  http://localhost:3000
#   Nginx gateway    →  http://localhost:80
#   PostgreSQL       →  localhost:5432
#   Redis            →  localhost:6379
#   ChromaDB         →  http://localhost:8001
#   Prometheus       →  http://localhost:9090
#   Grafana          →  http://localhost:3001  (admin / admin)
```

### Option 2 — Manual Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql+asyncpg://weathergpt:changeme@localhost:5432/weathergpt"
export REDIS_URL="redis://localhost:6379"
export NVIDIA_API_KEY="nvapi-..."
export OPENWEATHERMAP_API_KEY="your_key"
export API_KEYS="your-secret-key"

uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

### Option 3 — Manual Frontend

```bash
cd frontend
npm install
echo "VITE_API_BASE=http://localhost:8000" > .env.local
npm run dev
# → http://localhost:5173
```

> **Test without API keys**: set `DATABASE_URL=sqlite+aiosqlite:///:memory:` and leave `NVIDIA_API_KEY` empty. The NLP pipeline runs in keyword-only mode and returns deterministic SHA256-seeded weather answers.

---

## ⚙️ Environment Variables

### Required

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection (asyncpg) | `postgresql+asyncpg://weathergpt:changeme@postgres:5432/weathergpt` |
| `REDIS_URL` | Redis connection | `redis://redis:6379` |
| `OPENWEATHERMAP_API_KEY` | OWM key — weather, AQI, geo fallback | `abc123...` |
| `API_KEYS` | Comma-separated valid bearer keys | `prod-key-1,prod-key-2` |

### AI / LLM

| Variable | Default | Description |
|---|---|---|
| `NVIDIA_API_KEY` | — | NVIDIA NIM key — required for real LLM answers |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NIM endpoint |
| `NVIDIA_MODEL` | `meta/llama-3.2-11b-vision-instruct` | LLM model string |
| `WHISPER_MODEL_SIZE` | `base` | faster-whisper model size |

### Optional

| Variable | Default | Description |
|---|---|---|
| `IMD_API_KEY` | — | IMD direct API (OWM fallback works without it) |
| `WIS2_ENABLED` | `false` | Enable WMO WIS2.0 MQTT subscription |
| `WIS2_BROKER_HOST` | `globalbroker.meteo.fr` | WIS2 broker |
| `WIS2_BROKER_PORT` | `8883` | WIS2 TLS port |
| `NOMINATIM_USER_AGENT` | `weathergpt-sih2026` | Nominatim user agent |
| `CHROMADB_HOST` | `chromadb` | ChromaDB hostname |
| `CHROMADB_PORT` | `8001` | ChromaDB port |
| `TWILIO_ACCOUNT_SID` | — | SMS/WhatsApp fallback (wired in requirements, opt-in) |
| `TWILIO_AUTH_TOKEN` | — | Twilio auth |
| `GRAFANA_PASSWORD` | `admin` | Grafana admin password |
| `CACHE_TTL_SECONDS` | `900` | Weather Redis TTL (15 min) |

---

## 🌐 Frontend Pages & Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | `LandingPage` | Public | Hero, features, CTA. Redirects `/app` if already signed in. |
| `/auth` | `AuthPage` | Public | Firebase Google OAuth + email/password sign-in |
| `/team` | `TeamPage` | Public | Team Eloquence cards with click-to-expand detail + LinkedIn |
| `/onboarding` | `OnboardingPage` | 🔒 | First-run: language picker + location permission |
| `/app` | `HomePage` | 🔒 | Weather hero card, current conditions dashboard |
| `/app/chat` | `ChatPage` | 🔒 | Main conversational AI chat with suggestion chips |
| `/app/map` | `MapPage` | 🔒 | Leaflet/Carto map — coastal zones, cyclone tracks, rainfall overlay |
| `/app/cities` | `CitiesPage` | 🔒 | Browse and pin saved cities (citiesStore) |
| `/app/compare` | `ComparePage` | 🔒 | Side-by-side weather comparison for 2+ locations |
| `/app/alerts` | `AlertsPage` | 🔒 | Active alerts, threshold subscription management |
| `/app/history` | `HistoryPage` | 🔒 | Query history log |
| `/app/climate` | `ClimateTrendsPage` | 🔒 | Historical climate trend charts (ClimateTrendChart component) |
| `/app/settings` | `SettingsPage` | 🔒 | Language, notifications, preferences |
| `/app/developer` | `DeveloperPage` | 🔒 | API key, MCP setup tabs, tool reference, live try-it console |
| `/app/admin` | `AdminPage` | 🔒 | Per-user analytics — query count, intent distribution, feedback |
| `/app/about` | `AboutPage` | 🔒 | Data sources, methodology, PS compliance |
| `*` | — | — | Redirects `/` |

---

## 📡 API Reference

All endpoints (except `/health`, `/docs`, `/api/dev/key`) require:
```
X-API-Key: your-key
```

### POST /api/query — Main Chat Endpoint

```http
POST /api/query
Content-Type: application/json
X-API-Key: your-key

{
  "message": "kal Mumbai mein barish hogi kya?",
  "session_id": "uuid-v4-here",
  "location_hint": "Mumbai",
  "input_mode": "text"
}
```

**Response:**
```json
{
  "answer": "मुंबई में कल हल्की बारिश (8.2mm) की संभावना है, दक्षिण-पश्चिम से 22 km/h हवाएं।",
  "citations": [
    {
      "source": "OpenWeatherMap",
      "detail": "Live observation/forecast for Mumbai on 2026-09-01",
      "url": "https://api.openweathermap.org/data/2.5/weather"
    },
    {
      "source": "GFS (via Open-Meteo)",
      "detail": "GFS NWP forecast, generated_in_45ms",
      "url": "https://api.open-meteo.com/v1/forecast"
    }
  ],
  "weather_summary": {
    "location": "Mumbai",
    "date": "2026-09-01",
    "rainfall_mm": 8.2,
    "condition": "Rain",
    "nwp_model": "GFS",
    "wave_height_m": 1.4,
    "fishing_zone_safe": true,
    "coastal_zone": "Maharashtra Coast"
  },
  "alert_level": "none",
  "use_case_context": "general"
}
```

### All Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | `{"status":"ok","version":"3.0.0"}` |
| `POST` | `/api/query` | ✅ | Natural language query (full NLP pipeline) |
| `GET` | `/api/weather?lat=&lon=` | ✅ | Raw weather for coordinates |
| `GET` | `/api/aqi?location=` | ✅ | AQI + PM2.5/PM10/CO/NO₂/O₃ |
| `GET` | `/api/metar?icao=VIDP` | ✅ | Live METAR from aviationweather.gov |
| `GET` | `/api/agro?location=&crop=wheat` | ✅ | Crop-specific advisory |
| `GET` | `/api/climate/trend?location=&parameter=` | ✅ | Historical trend + change/decade |
| `POST` | `/api/alerts/subscribe` | ✅ | Subscribe to threshold alerts |
| `POST` | `/api/feedback` | ✅ | Submit thumbs up/down → HallucinationLog |
| `POST` | `/api/push/subscribe` | ✅ | Register Web Push endpoint |
| `POST` | `/api/voice/transcribe` | ✅ | Upload audio → transcribed text |
| `WS` | `/ws/alerts` | — | Real-time alert push (Redis SUBSCRIBE) |
| `GET` | `/api/admin/queries` | ✅ | Query log (scoped by API key) |
| `GET` | `/api/admin/stats` | ✅ | Intent distribution, top locations |
| `POST` | `/api/dev/key` | — | Auto-generate API key by Firebase email |
| `GET` | `/metrics` | — | Prometheus metrics |
| `GET` | `/docs` | — | Swagger UI |

---

## 🗄️ Database Schema

PostgreSQL 15. Prisma schema (`backend/prisma/schema.prisma`) is canonical; SQLAlchemy is the runtime ORM.

```
┌──────────────┐      ┌────────────────┐      ┌────────────────────┐
│     User     │ 1──* │    Session     │ 1──* │      Query         │
│──────────────│      │────────────────│      │────────────────────│
│ id (cuid)    │      │ id (cuid)      │      │ id                 │
│ apiKey       │      │ userId (FK)    │      │ sessionId (FK)     │
│ email        │      │ lang           │      │ message (raw)      │
│ name         │      │ createdAt      │      │ enText (translated)│
│ createdAt    │      └────────────────┘      │ intent             │
└──────────────┘                              │ slots (JSON)       │
       │ 1──*                                 │ response           │
       ▼                                      │ citations (JSON)   │
┌──────────────────┐                          │ lang               │
│ AlertSubscription│                          │ inputMode          │
│──────────────────│                          │ createdAt          │
│ userId (FK)      │                          └────────────────────┘
│ location         │
│ thresholdType    │   ┌─────────────────┐    ┌──────────────────┐
│ thresholdValue   │   │  ClimateRecord  │    │ HallucinationLog │
│ active           │   │─────────────────│    │──────────────────│
└──────────────────┘   │ location        │    │ queryId          │
                       │ parameter       │    │ response         │
┌──────────────────┐   │ year / month    │    │ issue            │
│  PushSubscription│   │ value / unit    │    │  ("positive_     │
│──────────────────│   │ source          │    │   feedback" for  │
│ endpoint (unique)│   └─────────────────┘    │   thumbs-up)     │
│ p256dh           │                          └──────────────────┘
│ auth             │
└──────────────────┘   ┌──────────────────┐
                       │  LocationCache   │
                       │──────────────────│
                       │ name (unique)    │
                       │ lat / lon        │
                       │ district / state │
                       │ country          │
                       │ geohash (6-char) │
                       └──────────────────┘
```

**`init_db()` is zero-downtime safe** — uses `ALTER TABLE IF NOT EXISTS` and `DO $$ IF NOT EXISTS` for constraints added after initial deploy (e.g. `users.email` column + unique constraint).

**Cache strategy:**
- `weather:v2:{name}:{date}` → 15 min TTL
- `gfs:v2:{lat}:{lon}:{date}` → 60 min TTL
- `wis2:{lat}:{lon}:latest` → 60 min TTL (WIS2 push data)
- `LocationCache` table → persistent geocoding cache (avoids repeat Nominatim)

---

## 🌍 Multilingual Support

**17 languages** with real NVIDIA NIM translation (not dictionary stubs):

<table>
<thead><tr><th>Language</th><th>Code</th><th>Script</th><th>Detection</th></tr></thead>
<tbody>
<tr><td>English</td><td>en</td><td>Latin</td><td>langdetect</td></tr>
<tr><td>Hindi</td><td>hi</td><td>Devanagari</td><td>Unicode block + langdetect</td></tr>
<tr><td>Tamil</td><td>ta</td><td>Tamil</td><td>Unicode block</td></tr>
<tr><td>Telugu</td><td>te</td><td>Telugu</td><td>Unicode block</td></tr>
<tr><td>Bengali</td><td>bn</td><td>Bengali</td><td>Unicode block</td></tr>
<tr><td>Marathi</td><td>mr</td><td>Devanagari</td><td>Unicode block + langdetect</td></tr>
<tr><td>Kannada</td><td>kn</td><td>Kannada</td><td>Unicode block</td></tr>
<tr><td>Gujarati</td><td>gu</td><td>Gujarati</td><td>Unicode block</td></tr>
<tr><td>Punjabi</td><td>pa</td><td>Gurmukhi</td><td>Unicode block</td></tr>
<tr><td>Odia</td><td>or</td><td>Odia</td><td>Unicode block</td></tr>
<tr><td>Malayalam</td><td>ml</td><td>Malayalam</td><td>Unicode block</td></tr>
<tr><td>Urdu</td><td>ur</td><td>Arabic</td><td>Unicode block</td></tr>
<tr><td>Arabic</td><td>ar</td><td>Arabic</td><td>Unicode block</td></tr>
<tr><td>French</td><td>fr</td><td>Latin</td><td>langdetect</td></tr>
<tr><td>Spanish</td><td>es</td><td>Latin</td><td>langdetect</td></tr>
<tr><td>Chinese (Simplified)</td><td>zh</td><td>CJK</td><td>Unicode block</td></tr>
<tr><td>Swahili</td><td>sw</td><td>Latin</td><td>langdetect</td></tr>
</tbody>
</table>

**How it works end-to-end:**
1. Unicode block heuristics resolve all Indian-script languages instantly (zero network calls)
2. `langdetect` (seeded, deterministic) handles Latin-script languages
3. NVIDIA NIM translates to English for intent/slot extraction
4. LLM writes the final answer **directly in the user's original language, in native script** — no back-translation call

---

## 🌾 Sector-Specific Features

### Farmer — Agro Advisory (8 crops)

| Crop | Max Safe Temp | Frost Risk Below | Water Need/Week | Notes |
|---|---|---|---|---|
| Wheat | 32°C | 4°C | 25mm | — |
| Rice | 38°C | — | 50mm | Needs standing water |
| Cotton | 40°C | 10°C | 30mm | — |
| Maize | 35°C | 2°C | 30mm | Hindi: makka |
| Sugarcane | 38°C | 5°C | 60mm | Hindi: ganna |
| Mustard | 30°C | 0°C | 20mm | Hindi: sarson |
| Soybean | 36°C | 2°C | 35mm | Hindi: soya |
| Groundnut | 38°C | — | 30mm | Hindi: mungfali |

### Fisherman — Marine Advisory

- Wave height from Open-Meteo Marine (real ocean model — **never synthetic**)
- SAFE verdict = wave_height ≤ 2.5m AND wind ≤ 45 km/h
- `None` for inland locations propagates correctly — LLM instructed to never guess
- Coastal zone resolved via Shapely point-in-polygon on `indian_coastal_zones.geojson`

### Pilot — Aviation Briefing

- Live METAR from `aviationweather.gov/api/data/metar` (free, no key)
- Returns: raw METAR, flight category (VFR/MVFR/IFR/LIFR), QNH, wind direction/speed, visibility, dewpoint
- ICAO code extracted by regex (`\b(V[A-Z]{3})\b`) covering all Indian airports

### Urban — AQI

- OWM Air Pollution API (same key as weather — no extra cost)
- Returns: AQI index 1–5 with label (Good/Fair/Moderate/Poor/Very Poor), PM2.5, PM10, CO, NO₂, O₃
- Injected as `extra_facts` into LLM context for the urban intent

---

## 🛰️ Data Sources

| Source | Data | Endpoint | Key Required? |
|---|---|---|---|
| **OpenWeatherMap** | Live weather | `api.openweathermap.org/data/2.5/weather` | Yes |
| **OWM Air Pollution** | AQI, PM2.5, PM10, CO, NO₂, O₃ | `api.openweathermap.org/data/2.5/air_pollution` | Same key |
| **OWM Geo** | Geocoding fallback | `api.openweathermap.org/geo/1.0/direct` | Same key |
| **Open-Meteo (GFS)** | 7-day NWP forecast | `api.open-meteo.com/v1/forecast?models=gfs_seamless` | **No** |
| **Open-Meteo Marine** | Wave height | `marine-api.open-meteo.com/v1/marine` | **No** |
| **Open-Meteo Archive** | Historical climate | `archive-api.open-meteo.com/v1/archive` | **No** |
| **aviationweather.gov** | METAR, flight category | `aviationweather.gov/api/data/metar` | **No** |
| **GDACS** | Cyclone (TC) + Flood (FL) alerts | `gdacs.org/gdacsapi/api/events/geteventlist/EVENTS4APP` | **No** |
| **Nominatim (OSM)** | Geocoding (primary) | `nominatim.openstreetmap.org` | **No** |
| **WIS2.0 MQTT** | Real-time WMO weather events | `globalbroker.meteo.fr:8883` (TLS) | **No** |
| **NVIDIA NIM** | LLM inference (Llama 3.2 11B) | `integrate.api.nvidia.com/v1` | Yes |

---

## ☁️ Deployment

### Railway (Primary)

```
Backend  →  https://backend-production-c6aa1.up.railway.app
Frontend →  https://frontend-production-9606.up.railway.app
```

Railway auto-deploys on every push to `main` via GitHub integration. Both services have `railway.json` declaring their build/start commands. PostgreSQL 15 and Redis 7 are managed Railway services.

### Vercel (Frontend Alternative)

```json
// frontend/vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    { "source": "/((?!.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }
  ]
}
```

Dashboard settings: **Framework Preset → Vite**, **Root Directory → `frontend/`**, **Include files outside root → Enabled**.

### Docker Compose (Production)

```bash
docker compose -f docker-compose.prod.yml up -d

# 8 services: fastapi, react-ui, nginx, postgres, redis, chromadb, prometheus, grafana
docker compose ps
docker compose logs -f fastapi
```

### Kubernetes

```bash
kubectl apply -f backend/k8s/
kubectl get deployments
kubectl scale deployment fastapi --replicas=3
```

---

## 📊 Monitoring

```
Prometheus  →  http://localhost:9090
Grafana     →  http://localhost:3001  (admin / admin)
Health      →  /health
Metrics     →  /metrics
```

Auto-instrumented via `prometheus-fastapi-instrumentator`:

- `http_request_duration_seconds` — P50/P95/P99 by endpoint
- `http_requests_total` — by status code
- `http_requests_in_progress` — active connections

Import `monitoring/grafana/dashboard.json` for the pre-built dashboard.

---

## 🧪 Testing

```bash
# Run full test suite
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing

# Run without Postgres or NVIDIA keys (SQLite in-memory)
DATABASE_URL=sqlite+aiosqlite:///:memory: \
API_KEYS=test-key \
NVIDIA_API_KEY="" \
OPENWEATHERMAP_API_KEY="" \
pytest tests/ -v
```

| Test File | Coverage Area |
|---|---|
| `test_api.py` | Core endpoints, auth, rate limiting |
| `test_nlp.py` | Intent classification, language detection, slot extraction |
| `test_weather.py` | OWM fetch, synthetic fallback, wave height |
| `test_gfs.py` | Open-Meteo GFS fetch and caching |
| `test_gis.py` | Nominatim geocoding, coastal zone, geohash |
| `test_disaster_service.py` | GDACS cyclone/flood parsing, Haversine filter |
| `test_new_services.py` | AQI, METAR, agro advisory |
| `test_voice.py` | faster-whisper transcription, stub fallback |
| `test_wis2.py` | WIS2.0 MQTT subscriber |
| `test_rag.py` | ChromaDB ingest and retrieve |

**Test fixtures**: `tests/silence.wav` — real WAV file for voice pipeline testing.

**Evaluation (LLM accuracy)**:
```bash
python eval/run_eval.py
# Compares model answers against eval/ground_truth.json
```

---

## 🔄 CI/CD Pipeline

`.github/workflows/deploy.yml` runs on every push to `main` and every pull request:

```
backend-test
  ├─ Python 3.11 setup
  ├─ pip install -r requirements.txt
  └─ pytest tests/ --cov=app

frontend-build
  ├─ Node 20 setup
  ├─ npm install
  └─ npm run build  (TypeScript check + Vite bundle)
```

Deploy is handled by Railway GitHub integration — no separate deploy step.

---

## 🗺️ Roadmap

All PS criteria gaps (P0) are now closed in the current build. Remaining items:

### 🟡 P1 — Frontend Polish
- [ ] Multi-day forecast cards (7-day — Open-Meteo data already available)
- [ ] Saved locations across sessions (currently in-memory citiesStore)
- [ ] Lighthouse PWA audit + score
- [ ] Voice E2E browser test with real microphone input

### 🟢 P2 — Backend & Infra
- [ ] GFS extended forecast date increment bug fix (`get_gfs_extended_forecast` passes same date N times)
- [ ] Per-user rate limiting (currently global 60/min)
- [ ] Top-100 city cache warm-up cron (APScheduler job — spec exists, not wired)
- [ ] Structured JSON logging for Railway log search
- [ ] Sentry error tracking (free tier)
- [ ] CORS restricted from `*` to production domain
- [ ] Custom domain (remove `*.up.railway.app`)
- [ ] SMS/WhatsApp via Twilio (stubbed in requirements, not wired)

---

## 👥 Team

Built with ❤️ for **Smart India Hackathon 2026** (PS SIH26068) by **Team Eloquence**.

> *Six of us, one SIH26068 build. Click a name for what each person actually shipped.*

<table>
<tr>
<td align="center" width="160">
<strong>Astitva Bhardwaj</strong><br/><em>Team Lead</em><br/>
<a href="https://www.linkedin.com/in/astitva-bhardwajlu/">🔗 LinkedIn</a>
</td>
<td>Set the architecture for Sanket and drove it from prototype to a deployed product. Rebuilt the entire frontend on the <strong>shilp-sutra design system</strong>, wired real <strong>Firebase authentication</strong> (Google and email) in place of the earlier mock login, integrated the <strong>Carto basemap</strong> for the live weather map, and manages the <strong>Railway deployment</strong> for both frontend and backend. Kept the team's individual pieces moving toward one shippable app.</td>
</tr>
<tr>
<td align="center" width="160">
<strong>Harsh Tripathi</strong><br/><em>NLP Engineer</em><br/>
<a href="https://www.linkedin.com/in/aaharsh11z/">🔗 LinkedIn</a>
</td>
<td>Built the <strong>natural-language query pipeline</strong> that turns a plain-language question — in any of 17 supported languages — into a weather answer: <strong>language detection</strong>, <strong>intent classification</strong>, <strong>location extraction</strong>, and the logic that stitches together data from IMD, OWM, and Open-Meteo into one cited response.</td>
</tr>
<tr>
<td align="center" width="160">
<strong>Ashish Prajapati</strong><br/><em>Backend Engineer</em><br/>
<a href="https://www.linkedin.com/in/ashish-kumar-prajapati-6b188937a/">🔗 LinkedIn</a>
</td>
<td>Built the <strong>FastAPI backend</strong> that every screen in the app calls into: the live weather and AQI routes, the crop advisory and METAR endpoints, the climate-trend archive lookup, and the alert subscription system. Designed the <strong>SQLAlchemy models</strong> (users, sessions, queries, alerts) that back all of it.</td>
</tr>
<tr>
<td align="center" width="160">
<strong>Kulshreshtha Sharma</strong><br/><em>Frontend Engineer</em><br/>
<a href="https://www.linkedin.com/in/kulshrestha-sharma/">🔗 LinkedIn</a>
</td>
<td>Built out the core app shell screens people actually live in day to day: <strong>chat</strong>, the <strong>saved-cities list</strong>, the <strong>side-by-side city comparison view</strong>, and <strong>alert subscriptions</strong>, plus the shared UI components those screens are built from.</td>
</tr>
<tr>
<td align="center" width="160">
<strong>Riya Mishra</strong><br/><em>DevOps</em><br/>
<a href="https://www.linkedin.com/in/riya-mishra-94162b395/">🔗 LinkedIn</a>
</td>
<td>Set up the <strong>Docker builds</strong> and <strong>Kubernetes/monitoring configuration</strong> behind the app, and kept the <strong>CI/CD pipeline</strong> reliable so every push actually made it into a working build instead of a broken one.</td>
</tr>
<tr>
<td align="center" width="160">
<strong>Anirudh Singh</strong><br/><em>QA & Testing</em><br/>
<a href="https://www.linkedin.com/in/anirudh-singh-360621236/">🔗 LinkedIn</a>
</td>
<td>Ran the <strong>test suite and manual QA passes</strong> across the app, catching regressions in the <strong>voice input</strong>, the <strong>onboarding flow</strong>, and the <strong>alert subscription screen</strong> before they reached a build people could actually use.</td>
</tr>
</table>

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">

**Sanket · Team Eloquence · Smart India Hackathon 2026 · PS SIH26068**

<sub>Ministry of Earth Sciences · Real data. Zero hallucination. 17 languages. Built for India. 🇮🇳</sub>

</div>