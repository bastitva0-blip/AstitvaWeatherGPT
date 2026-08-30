<div align="center">

<br/>

# 🌦️ Sanket

### Conversational AI for Weather Forecasting, Alerts & Climate Intelligence
#### *Powered by WeatherGPT · Built for the people who need it most*

<p align="center">
  <img src="https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange?style=for-the-badge&logo=india" alt="SIH 2026"/>
  <img src="https://img.shields.io/badge/PS-SIH26068-blue?style=for-the-badge" alt="Problem Statement"/>
  <img src="https://img.shields.io/badge/Ministry%20of%20Earth%20Sciences-IMD-green?style=for-the-badge" alt="MoES IMD"/>
  <img src="https://img.shields.io/badge/Team-Eloquence-purple?style=for-the-badge" alt="Team Eloquence"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-Manifests-326CE5?style=flat-square&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/NVIDIA%20NIM-Llama%203.2-76B900?style=flat-square&logo=nvidia&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

<p align="center">
  <a href="https://frontend-production-9606.up.railway.app"><strong>🌐 Live Demo</strong></a> ·
  <a href="https://backend-production-c6aa1.up.railway.app/docs"><strong>📖 API Docs</strong></a> ·
  <a href="https://backend-production-c6aa1.up.railway.app/health"><strong>💚 Health Check</strong></a>
</p>

<br/>

> **Sanket** is a production-grade, AI-powered weather intelligence platform built for the Indian Ministry of Earth Sciences.  
> It understands natural language queries in **18 languages**, integrates **real-time weather data** from IMD, OpenWeatherMap, GFS, and Open-Meteo,  
> and delivers grounded, citation-backed answers — zero hallucination by design.

<br/>

</div>

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🧠 AI & NLP Pipeline](#-ai--nlp-pipeline)
- [🗂️ Project Structure](#️-project-structure)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Local Development (Docker Compose)](#local-development-docker-compose)
  - [Manual Setup (Backend)](#manual-setup-backend)
  - [Manual Setup (Frontend)](#manual-setup-frontend)
- [⚙️ Environment Variables](#️-environment-variables)
- [🌐 Frontend Pages & Routes](#-frontend-pages--routes)
- [📡 API Reference](#-api-reference)
- [🗄️ Database Schema](#️-database-schema)
- [🌍 Multilingual Support](#-multilingual-support)
- [🛰️ Data Sources](#️-data-sources)
- [☁️ Deployment](#️-deployment)
  - [Railway (Primary)](#railway-primary)
  - [Docker Compose (Production)](#docker-compose-production)
  - [Kubernetes](#kubernetes)
- [📊 Monitoring](#-monitoring)
- [🧪 Testing](#-testing)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [🗺️ Roadmap](#️-roadmap)
- [👥 Team](#-team)
- [📄 License](#-license)

---

## ✨ Features

<table>
<thead>
<tr>
<th>Category</th>
<th>Feature</th>
<th>Status</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="4"><strong>🌦️ Weather Intelligence</strong></td>
<td>Real-time weather retrieval (OpenWeatherMap + IMD)</td>
<td>✅ Live</td>
</tr>
<tr>
<td>GFS Numerical Weather Prediction (NWP) via Open-Meteo</td>
<td>✅ Live</td>
</tr>
<tr>
<td>7–16 day extended forecasts</td>
<td>✅ Live</td>
</tr>
<tr>
<td>Wave height & marine sea-safety verdict for fishermen</td>
<td>✅ Live</td>
</tr>
<tr>
<td rowspan="3"><strong>🤖 Conversational AI</strong></td>
<td>Natural language query understanding (18 languages)</td>
<td>✅ Live</td>
</tr>
<tr>
<td>NVIDIA NIM Llama 3.2 11B — grounded, cited answers</td>
<td>✅ Live</td>
</tr>
<tr>
<td>RAG (Retrieval-Augmented Generation) via ChromaDB</td>
<td>✅ Live</td>
</tr>
<tr>
<td rowspan="3"><strong>🚨 Alerts & Safety</strong></td>
<td>WebSocket + Redis real-time alert push</td>
<td>✅ Live</td>
</tr>
<tr>
<td>Threshold-based alert subscriptions (rainfall, heatwave, wave height)</td>
<td>✅ Live</td>
</tr>
<tr>
<td>Cyclone track & flood warnings</td>
<td>🚧 Partial</td>
</tr>
<tr>
<td rowspan="3"><strong>🌾 Sector-Specific</strong></td>
<td>Agro-advisory (crop-specific weather guidance for farmers)</td>
<td>🚧 Partial</td>
</tr>
<tr>
<td>Aviation briefing (METAR, QNH, flight category)</td>
<td>🚧 Partial</td>
</tr>
<tr>
<td>AQI & urban air quality monitoring</td>
<td>🚧 Partial</td>
</tr>
<tr>
<td rowspan="2"><strong>🗺️ GIS & Maps</strong></td>
<td>Nominatim geocoding + geohash + coastal zone overlay</td>
<td>✅ Live</td>
</tr>
<tr>
<td>Leaflet map with cyclone tracks, rainfall heatmap, coastal zones</td>
<td>✅ Live</td>
</tr>
<tr>
<td rowspan="2"><strong>🎙️ Voice</strong></td>
<td>Voice transcription via faster-whisper (CTranslate2)</td>
<td>🚧 Partial</td>
</tr>
<tr>
<td>End-to-end voice query → answer flow</td>
<td>🚧 In Progress</td>
</tr>
<tr>
<td rowspan="2"><strong>📱 PWA</strong></td>
<td>Installable Progressive Web App (mobile + desktop)</td>
<td>✅ Live</td>
</tr>
<tr>
<td>Firebase push notifications + offline banner</td>
<td>✅ Live</td>
</tr>
<tr>
<td rowspan="2"><strong>🔧 Platform</strong></td>
<td>Admin dashboard, query history, developer API console</td>
<td>✅ Live</td>
</tr>
<tr>
<td>Prometheus metrics + Grafana dashboards</td>
<td>✅ Live</td>
</tr>
</tbody>
</table>

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                   │
│                                                                         │
│   React 18 + TypeScript + Vite   ──►  PWA (installable, offline-ready) │
│   Tailwind CSS v4 · Framer Motion · Leaflet · i18next (18 langs)        │
│   Zustand stores · Firebase push notifications                          │
└────────────────────────────┬────────────────────────────────────────────┘
                             │  HTTPS / WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Nginx)                             │
│          /api/* → FastAPI:8000    /  → React:3000                      │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend  (v3.0.0)                          │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐  │
│  │  /query  │  │/weather  │  │ /alerts  │  │  /voice   │  │ /admin │  │
│  └────┬─────┘  └──────────┘  └──────────┘  └───────────┘  └────────┘  │
│       │                                                                 │
│       ▼   NLP Pipeline                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  lang detect → translate → intent classify → slot extract        │   │
│  └───────────────────────────┬─────────────────────────────────────┘   │
│                              │                                          │
│       ┌──────────────────────┼──────────────────────┐                  │
│       ▼                      ▼                      ▼                  │
│  ┌──────────┐         ┌────────────┐         ┌───────────┐             │
│  │ weather  │         │ gfs_service│         │rag_service│             │
│  │ service  │         │(Open-Meteo)│         │(ChromaDB) │             │
│  └────┬─────┘         └─────┬──────┘         └─────┬─────┘            │
│       │                     │                      │                   │
│       └─────────────────────┴──────────────────────┘                   │
│                              │                                          │
│                              ▼                                          │
│                   ┌──────────────────┐                                  │
│                   │  llm_service     │  ← NVIDIA NIM (Llama 3.2 11B)   │
│                   │  (grounded only) │    Answer written in user's lang │
│                   └──────────────────┘                                  │
│                                                                         │
│  APScheduler · SlowAPI rate-limiting · Prometheus instrumentation       │
└──────────┬─────────────────────────────┬────────────────────────────────┘
           │                             │
           ▼                             ▼
┌──────────────────┐           ┌─────────────────────┐
│   PostgreSQL 15  │           │    Redis 7           │
│  (SQLAlchemy     │           │  · Weather cache     │
│   asyncpg)       │           │  · WIS2 alert msgs   │
│  Prisma schema   │           │  · WebSocket pub/sub │
└──────────────────┘           └─────────────────────┘
           │
           ▼
┌──────────────────┐           ┌─────────────────────┐
│  ChromaDB        │           │   WIS2.0 MQTT Broker │
│  (RAG vector     │           │   globalbroker.      │
│   store)         │           │   meteo.fr:8883      │
└──────────────────┘           └─────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **LLM used only for answer text, never for facts** | Prevents hallucination — all weather data, citations, and alert levels come from real API calls, assembled in code. LLM writes only the final natural-language sentence. |
| **Keyword classifier for intent/slots, not LLM** | Eliminated 2 extra LLM round-trips (~13–15s latency) on the hot path. LLM budget spent once on grounded answer generation. |
| **Write answer directly in target language** | Eliminated a second back-translation LLM call, cutting ~1.3–3s per non-English query. |
| **NVIDIA NIM Llama 3.2 11B over 120B reasoning model** | ~1.3s/call vs 10–15s. Meets the PS's <2000ms P95 latency criterion. |
| **SQLAlchemy asyncpg + Prisma schema** | Runtime uses SQLAlchemy for async performance; Prisma schema is canonical documentation and supports codegen. |

---

## 🧠 AI & NLP Pipeline

Every query flows through a deterministic, latency-optimized pipeline:

```
User message (any language)
        │
        ▼
 1. Language Detection
    ├── Unicode block heuristic (Malayalam, Tamil, Telugu, Hindi, etc.)
    └── langdetect fallback for Latin-script languages

        │
        ▼
 2. Translation to English (NVIDIA NIM)
    └── Passthrough if already English (or LLM not configured → test mode)

        │
        ▼
 3. Intent Classification (deterministic keyword classifier)
    ┌─────────────────────────────────────────────────────────┐
    │  forecast_query    │  alert_check       │  agro_advisory │
    │  historical_climate│  cyclone_track     │  general_weather│
    │  aviation_briefing │  marine_advisory   │  climate_trend  │
    │  urban_monitoring  │  clarification_needed               │
    └─────────────────────────────────────────────────────────┘

        │
        ▼
 4. Slot Extraction (keyword classifier)
    location · date · date_range · crop_type ·
    weather_parameter · icao_code · fishing_zone

        │
        ▼
 5. Parallel Data Fetch (asyncio.gather)
    ├── weather_service  (OWM + IMD + Open-Meteo marine)
    ├── gfs_service      (GFS NWP via Open-Meteo)
    ├── rag_service      (ChromaDB context retrieval)
    ├── gis_service      (coastal zone — marine only)
    └── aqi_service      (OWM Air Pollution — urban only)

        │
        ▼
 6. LLM Answer Generation (NVIDIA NIM, Llama 3.2 11B)
    Written directly in the user's target language.
    Facts injected from step 5 — model cannot invent numbers.

        │
        ▼
 7. Response Assembly (code, never LLM)
    answer · citations · weather_summary · alert_level · use_case_context

        │
        ▼
 8. Persist to PostgreSQL (Query row + Session)
```

### Intent → Use-Case Routing

| Intent | Use Case Context | Special Services Called |
|---|---|---|
| `forecast_query` | `general` | weather, gfs |
| `marine_advisory` | `fisherman` | weather, gfs, coastal_zone |
| `agro_advisory` | `farmer` | weather, gfs, agro_service |
| `aviation_briefing` | `aviation` | aviation_service (METAR) |
| `urban_monitoring` | `urban` | weather, aqi_service |
| `climate_trend` | `researcher` | climate_service |
| `alert_check` | `disaster` | weather, alerts |

---

## 🗂️ Project Structure

```
AstitvaWeatherGPT/
│
├── 📁 backend/
│   ├── 📁 app/
│   │   ├── 📁 core/
│   │   │   ├── auth.py           # API key verification
│   │   │   ├── cache.py          # Redis connection helpers
│   │   │   └── config.py         # Pydantic settings (env-driven)
│   │   ├── 📁 models/
│   │   │   ├── database.py       # SQLAlchemy async models
│   │   │   └── schemas.py        # Pydantic request/response schemas
│   │   ├── 📁 routes/
│   │   │   ├── query.py          # POST /api/query  (main chat endpoint)
│   │   │   ├── weather.py        # GET  /api/weather
│   │   │   ├── alerts.py         # POST /api/alerts/subscribe
│   │   │   ├── admin.py          # GET  /api/admin/*
│   │   │   ├── voice.py          # POST /api/voice/transcribe
│   │   │   ├── climate.py        # GET  /api/climate/trend
│   │   │   ├── websocket.py      # WS   /ws/alerts
│   │   │   └── misc.py           # GET  /api/cities, /api/compare, etc.
│   │   ├── 📁 services/
│   │   │   ├── nlp_service.py    # Full NLP pipeline (detect→translate→intent→slots)
│   │   │   ├── llm_service.py    # NVIDIA NIM answer generation (grounded)
│   │   │   ├── llm_client.py     # Raw NVIDIA NIM HTTP client
│   │   │   ├── weather_service.py# OWM + IMD + Open-Meteo fetch & waterfall
│   │   │   ├── gfs_service.py    # GFS NWP forecasts via Open-Meteo
│   │   │   ├── gis_service.py    # Nominatim geocoding + coastal zone GIS
│   │   │   ├── rag_service.py    # ChromaDB RAG retrieval
│   │   │   ├── aqi_service.py    # OWM Air Pollution API
│   │   │   ├── aviation_service.py # METAR from aviationweather.gov
│   │   │   ├── agro_service.py   # Crop-specific advisory rules
│   │   │   ├── alert_service.py  # Threshold checking + Redis pub
│   │   │   ├── climate_service.py# Historical climate trend queries
│   │   │   ├── disaster_service.py # Cyclone / heatwave detection
│   │   │   ├── voice_service.py  # faster-whisper transcription
│   │   │   └── wis2_service.py   # WIS2.0 MQTT subscriber
│   │   └── main.py               # FastAPI app factory, lifespan, middleware
│   ├── 📁 data/
│   │   └── indian_coastal_zones.geojson
│   ├── 📁 eval/
│   │   ├── ground_truth.json     # Evaluation ground-truth Q&A
│   │   └── run_eval.py           # Automated accuracy evaluation
│   ├── 📁 k8s/
│   │   ├── deployment-fastapi.yaml
│   │   ├── deployment-frontend.yaml
│   │   └── services.yaml
│   ├── 📁 prisma/
│   │   └── schema.prisma         # Canonical DB schema
│   ├── 📁 tests/                 # pytest test suite
│   ├── Dockerfile
│   ├── requirements.txt
│   └── railway.json
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 Chat/          # ChatBubble, ChatInput, FeedbackButtons, SuggestionChips
│   │   │   ├── 📁 Map/           # WeatherMap, CoastalZones, LayerToggle, TimelineScrubber
│   │   │   ├── 📁 Shell/         # TopBar, Sidebar, BottomNav, OfflineBanner
│   │   │   ├── 📁 UI/            # AlertToast, ClimateTrendChart, VoiceButton, LanguageSelect
│   │   │   └── 📁 Weather/       # WeatherHeroCard, AQICard, StatGrid, FloodBanner, CycloneFullscreen
│   │   ├── 📁 pages/             # All route-level page components (15 pages)
│   │   ├── 📁 stores/            # Zustand stores (auth, chat, alerts, cities, lang, feedback)
│   │   ├── 📁 hooks/             # useVoiceRecorder, useWebSocket, useOnlineStatus, usePushNotifications
│   │   ├── 📁 i18n/              # 18 language JSON translation files
│   │   ├── 📁 lib/               # api.ts, firebase.ts, push.ts, feedback.ts
│   │   └── 📁 styles/            # app.css, base.css, landing.css, tokens.css
│   ├── 📁 public/icons/          # PWA icons (72–512px)
│   ├── Dockerfile
│   ├── vite.config.ts
│   ├── package.json
│   └── railway.json
│
├── 📁 monitoring/
│   ├── prometheus.yml
│   └── grafana/dashboard.json
│
├── 📁 nginx/
│   └── nginx.conf
│
├── 📁 .github/workflows/
│   └── deploy.yml                # GitHub Actions CI/CD
│
├── docker-compose.yml            # Local development (all services)
├── docker-compose.prod.yml       # Production overrides
├── .env.example
└── ROADMAP.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Docker + Docker Compose | v24+ |
| Node.js | ≥ 20.0.0 |
| Python | 3.11 |
| Git | any |

You'll also need API keys — see [Environment Variables](#️-environment-variables).

---

### Local Development (Docker Compose)

The fastest way to run everything locally — one command spins up all 8 services:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/AstitvaWeatherGPT.git
cd AstitvaWeatherGPT

# 2. Copy the environment template and fill in your keys
cp .env.example .env
# Edit .env with your NVIDIA_API_KEY, OPENWEATHERMAP_API_KEY, etc.

# 3. Start all services
docker compose up --build

# Services started:
#   FastAPI backend  →  http://localhost:8000
#   React frontend   →  http://localhost:3000
#   Nginx gateway    →  http://localhost:80
#   PostgreSQL       →  localhost:5432
#   Redis            →  localhost:6379
#   ChromaDB         →  http://localhost:8001
#   Prometheus       →  http://localhost:9090
#   Grafana          →  http://localhost:3001  (admin / admin)
```

---

### Manual Setup (Backend)

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create a .env file)
export DATABASE_URL="postgresql+asyncpg://weathergpt:changeme@localhost:5432/weathergpt"
export REDIS_URL="redis://localhost:6379"
export NVIDIA_API_KEY="nvapi-..."
export OPENWEATHERMAP_API_KEY="your_key_here"
export API_KEYS="your-secret-key"

# Start the development server (with hot-reload)
uvicorn app.main:app --reload --port 8000

# API docs available at:
#   http://localhost:8000/docs     (Swagger UI)
#   http://localhost:8000/redoc    (ReDoc)
#   http://localhost:8000/health   (Health check)
```

---

### Manual Setup (Frontend)

```bash
cd frontend

# Install dependencies
npm install

# Set backend URL (optional — defaults to localhost:8000)
echo "VITE_API_BASE=http://localhost:8000" > .env.local

# Start the dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure the following:

### Core Database & Cache

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) | `postgresql+asyncpg://weathergpt:changeme@postgres:5432/weathergpt` |
| `POSTGRES_USER` | PostgreSQL username | `weathergpt` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `changeme` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |

### AI & LLM

| Variable | Description | Example |
|---|---|---|
| `NVIDIA_API_KEY` | NVIDIA NIM API key — required for LLM answers | `nvapi-...` |
| `NVIDIA_BASE_URL` | NVIDIA NIM base URL | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | LLM model identifier | `meta/llama-3.2-11b-vision-instruct` |
| `WHISPER_MODEL_SIZE` | Whisper model size for voice transcription | `base` |

### External Weather APIs

| Variable | Description | Required? |
|---|---|---|
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap API key (weather + AQI) | **Yes** |
| `IMD_API_KEY` | IMD direct API key (optional — OWM fallback works) | No |

### Application Security

| Variable | Description | Example |
|---|---|---|
| `API_KEYS` | Comma-separated valid API keys for bearer auth | `prod-key-1,prod-key-2` |

### Notifications (Optional)

| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio SID for SMS/WhatsApp fallback |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | WhatsApp sender number |

### WIS2.0 / MQTT (Optional)

| Variable | Default | Description |
|---|---|---|
| `WIS2_ENABLED` | `false` | Enable WMO WIS2.0 MQTT subscription |
| `WIS2_BROKER_HOST` | `globalbroker.meteo.fr` | WIS2 global broker host |
| `WIS2_BROKER_PORT` | `8883` | WIS2 broker TLS port |

### Monitoring

| Variable | Default | Description |
|---|---|---|
| `GRAFANA_PASSWORD` | `admin` | Grafana admin password |

---

## 🌐 Frontend Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Public landing — hero, features, CTA |
| `/auth` | `AuthPage` | API key login / registration |
| `/team` | `TeamPage` | Team members with photos |
| `/onboarding` | `OnboardingPage` | First-run: language picker + location permission |
| `/app` | `HomePage` | Dashboard — weather hero card, current conditions |
| `/app/chat` | `ChatPage` | Main conversational AI chat interface |
| `/app/map` | `MapPage` | Leaflet map — cyclone tracks, coastal zones, rainfall |
| `/app/cities` | `CitiesPage` | Browse and pin saved cities |
| `/app/compare` | `ComparePage` | Side-by-side weather comparison for 2+ locations |
| `/app/alerts` | `AlertsPage` | Active alerts, subscriptions management |
| `/app/history` | `HistoryPage` | Query history log |
| `/app/climate` | `ClimateTrendsPage` | Historical climate trend charts (D3) |
| `/app/settings` | `SettingsPage` | Language, notifications, preferences |
| `/app/developer` | `DeveloperPage` | API console, key management, docs links |
| `/app/admin` | `AdminPage` | Admin dashboard — analytics, query stats |
| `/app/about` | `AboutPage` | Data sources, methodology, PS compliance |

---

## 📡 API Reference

All endpoints require the header `X-API-Key: <your-key>` unless stated otherwise.

### Core Query

```http
POST /api/query
Content-Type: application/json
X-API-Key: your-key

{
  "message": "Will it rain in Mumbai tomorrow?",
  "session_id": "uuid-session-id",
  "location_hint": "Mumbai",   // optional override
  "input_mode": "text"         // "text" | "voice"
}
```

**Response:**
```json
{
  "answer": "Mumbai will see light rainfall tomorrow (8.2mm expected), with gusty winds at 22 km/h from the southwest.",
  "citations": [
    {
      "source": "OpenWeatherMap",
      "detail": "Live observation/forecast for Mumbai on 2026-08-31",
      "url": "https://openweathermap.org/city/1275339"
    },
    {
      "source": "GFS (via Open-Meteo)",
      "detail": "GFS NWP forecast, 2026-08-31T00:00Z",
      "url": "https://api.open-meteo.com/v1/forecast"
    }
  ],
  "weather_summary": {
    "location": "Mumbai",
    "date": "2026-08-31",
    "rainfall_mm": 8.2,
    "condition": "light rain",
    "wave_height_m": 1.4,
    "fishing_zone_safe": true,
    "coastal_zone": "Maharashtra Coast"
  },
  "alert_level": "advisory",
  "use_case_context": "general"
}
```

### Other Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check — `{"status":"ok","version":"3.0.0"}` |
| `GET` | `/api/weather?lat=&lon=` | Raw weather data for coordinates |
| `POST` | `/api/alerts/subscribe` | Subscribe to threshold-based alerts |
| `GET` | `/api/climate/trend?location=&parameter=` | Historical climate trend |
| `POST` | `/api/voice/transcribe` | Upload audio file → transcribed text |
| `WS` | `/ws/alerts` | WebSocket stream for real-time alert push |
| `GET` | `/api/admin/queries` | Query log (admin only) |
| `GET` | `/api/admin/stats` | Usage statistics |
| `GET` | `/metrics` | Prometheus metrics endpoint |
| `GET` | `/docs` | Swagger UI (auto-generated) |

### Alert Subscription

```http
POST /api/alerts/subscribe
Content-Type: application/json
X-API-Key: your-key

{
  "user_api_key": "your-key",
  "location": "Kochi",
  "threshold_type": "wave_height",   // rainfall | cyclone | heatwave | wave_height | marine_warning | fishermen_alert
  "threshold_value": 2.5
}
```

---

## 🗄️ Database Schema

The database is PostgreSQL 15 with PostGIS. The Prisma schema (`backend/prisma/schema.prisma`) is the canonical reference; SQLAlchemy (asyncpg) is the runtime ORM.

```
┌─────────────┐      ┌──────────────┐      ┌──────────┐
│    User     │ 1──* │   Session    │ 1──* │  Query   │
│─────────────│      │──────────────│      │──────────│
│ id (cuid)   │      │ id (cuid)    │      │ id       │
│ apiKey      │      │ userId       │      │ sessionId│
│ name        │      │ lang         │      │ message  │
│ createdAt   │      │ createdAt    │      │ enText   │
└─────────────┘      └──────────────┘      │ intent   │
       │                                   │ slots    │
       │ 1──*                              │ response │
       ▼                                   │ citations│
┌──────────────────┐                       │ lang     │
│ AlertSubscription│                       │ inputMode│
│──────────────────│                       └──────────┘
│ id               │
│ userId           │     ┌────────────────┐     ┌──────────────────┐
│ location         │     │ ClimateRecord  │     │ HallucinationLog │
│ thresholdType    │     │────────────────│     │──────────────────│
│ thresholdValue   │     │ location       │     │ queryId          │
│ active           │     │ parameter      │     │ response         │
└──────────────────┘     │ year / month   │     │ issue            │
                         │ value / unit   │     └──────────────────┘
                         └────────────────┘
                                             ┌──────────────────┐
                                             │  LocationCache   │
                                             │──────────────────│
                                             │ name (unique)    │
                                             │ lat / lon        │
                                             │ district / state │
                                             │ geohash          │
                                             └──────────────────┘
```

**Caching Strategy:**
- Weather data: 15 minutes TTL in Redis (`CACHE_TTL_SECONDS=900`)
- Location geocoding: Persistent in `LocationCache` table (avoids repeat Nominatim hits)
- Top-100 city prefetch: APScheduler cron (configured, implementation in progress)

---

## 🌍 Multilingual Support

WeatherGPT supports **18 languages** with real LLM-powered translation (not dictionary stubs):

<table>
<thead>
<tr>
<th>Language</th>
<th>Code</th>
<th>Script</th>
<th>Detection Method</th>
</tr>
</thead>
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

**How it works:**
1. User sends query in any language
2. Unicode block heuristics identify Indian-script languages instantly (no network call)
3. `langdetect` handles Latin-script languages
4. NVIDIA NIM translates to English for intent/slot extraction
5. LLM writes the final answer **directly in the user's original language** — no extra back-translation call

---

## 🛰️ Data Sources

| Source | Data Type | Endpoint | Key Required? |
|---|---|---|---|
| **OpenWeatherMap** | Live weather, forecasts | `api.openweathermap.org/data/2.5/weather` | Yes (`OPENWEATHERMAP_API_KEY`) |
| **OpenWeatherMap Air Pollution** | AQI, PM2.5, PM10 | `api.openweathermap.org/data/2.5/air_pollution` | Same key |
| **Open-Meteo** | GFS NWP forecasts (7–16 days) | `api.open-meteo.com/v1/forecast` | **No** (free, no key) |
| **Open-Meteo Marine** | Wave height, ocean data | `marine-api.open-meteo.com` | **No** |
| **Open-Meteo Historical** | Historical climate data | `archive-api.open-meteo.com` | **No** |
| **aviationweather.gov** | METAR, flight category, QNH | `aviationweather.gov/api/data/metar` | **No** |
| **IMD (Mausam)** | Official India weather | `mausam.imd.gov.in` | Optional |
| **Nominatim (OSM)** | Geocoding, location resolution | `nominatim.openstreetmap.org` | **No** |
| **WIS2.0 MQTT Broker** | Real-time WMO weather events | `globalbroker.meteo.fr:8883` | **No** |
| **INCOIS** | Indian Ocean + coastal data | Referenced in GIS service | — |
| **NVIDIA NIM** | LLM inference (Llama 3.2 11B) | `integrate.api.nvidia.com/v1` | Yes (`NVIDIA_API_KEY`) |

---

## ☁️ Deployment

### Railway (Primary)

The project is deployed on [Railway](https://railway.app) with automatic deploys on every push to `main`.

```
Backend  →  https://backend-production-c6aa1.up.railway.app
Frontend →  https://frontend-production-9606.up.railway.app
```

Railway reads `backend/railway.json` and `frontend/railway.json` for build/start commands. Both services build from their respective `Dockerfile`.

**Managed services on Railway:**
- PostgreSQL 15 (with automatic backups on paid plans)
- Redis 7

No additional CI/CD step needed for Railway — it picks up changes via GitHub integration automatically.

---

### Docker Compose (Production)

```bash
# Production compose (no volume mounts — uses built image)
docker compose -f docker-compose.prod.yml up -d

# Check running services
docker compose ps

# View backend logs
docker compose logs -f fastapi

# Run database migrations (if needed)
docker compose exec fastapi python -m app.models.database
```

The full production stack includes:

| Service | Image | Port |
|---|---|---|
| `fastapi` | Custom (Dockerfile) | 8000 |
| `react-ui` | Custom (Dockerfile) | 3000 |
| `nginx` | nginx:alpine | 80 |
| `postgres` | postgis/postgis:15-3.3 | 5432 |
| `redis` | redis:7-alpine | 6379 |
| `chromadb` | chromadb/chroma:latest | 8001 |
| `prometheus` | prom/prometheus:latest | 9090 |
| `grafana` | grafana/grafana:latest | 3001 |

---

### Kubernetes

Kubernetes manifests are available in `backend/k8s/` for teams that need orchestration:

```bash
# Apply all manifests
kubectl apply -f backend/k8s/

# Check deployments
kubectl get deployments
kubectl get services

# Scale the backend
kubectl scale deployment fastapi --replicas=3
```

> **Note:** K8s manifests are provided but the primary deployment target is Railway. Autoscaling HPA configuration is on the roadmap.

---

## 📊 Monitoring

### Prometheus + Grafana

Metrics are automatically instrumented via `prometheus-fastapi-instrumentator`:

```bash
# Prometheus metrics
http://localhost:9090

# Grafana dashboard (admin / admin)
http://localhost:3001
```

**Key metrics tracked:**
- `http_request_duration_seconds` — Request latency by endpoint (P50, P95, P99)
- `http_requests_total` — Request count by status code
- `http_requests_in_progress` — Active connections
- Custom metrics: intent distribution, LLM call latency, cache hit rate

The pre-built Grafana dashboard (`monitoring/grafana/dashboard.json`) can be imported directly.

### Health Check

```bash
curl https://backend-production-c6aa1.up.railway.app/health
# {"status":"ok","service":"WeatherGPT","version":"3.0.0"}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest tests/ -v

# With coverage report
pytest tests/ --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/test_api.py -v
pytest tests/test_nlp.py -v

# Run with specific markers
pytest tests/ -k "weather" -v
```

Tests run against SQLite in-memory (no Postgres needed locally):

```bash
DATABASE_URL=sqlite+aiosqlite:///:memory: \
API_KEYS=test-key \
NVIDIA_API_KEY="" \
OPENWEATHERMAP_API_KEY="" \
pytest tests/
```

**Test coverage areas:**

| Test File | Coverage |
|---|---|
| `test_api.py` | Core API endpoints, auth, rate limiting |
| `test_nlp.py` | Intent classification, language detection, slot extraction |
| `test_weather.py` | Weather service fetch & waterfall fallback |
| `test_gfs.py` | GFS NWP data fetching |
| `test_gis.py` | Geocoding, coastal zone resolution |
| `test_disaster_service.py` | Cyclone, heatwave detection |
| `test_voice.py` | Whisper transcription pipeline |
| `test_wis2.py` | WIS2 MQTT subscriber |
| `test_rag.py` | ChromaDB retrieval |
| `test_new_services.py` | AQI, aviation, agro services |

### Frontend Tests

```bash
cd frontend

# Run tests (Vitest)
npm run test

# Build check (TypeScript + Vite)
npm run build
```

### Evaluation (LLM Accuracy)

```bash
cd backend
python eval/run_eval.py
# Compares model answers against ground_truth.json
# Outputs accuracy score and per-query diffs
```

---

## 🔄 CI/CD Pipeline

GitHub Actions runs on every push to `main` and on every pull request:

```yaml
# .github/workflows/deploy.yml

backend-test job:
  ├── Python 3.11 setup
  ├── pip install -r requirements.txt
  └── pytest tests/ --cov=app

frontend-build job:
  ├── Node 20 setup
  ├── npm install
  └── npm run build          # TypeScript check + Vite bundle
```

**Deploy** is handled by Railway's GitHub integration — no separate deploy job is needed. Merging to `main` automatically triggers Railway's build pipeline for both backend and frontend.

---

## 🗺️ Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for the full production roadmap. The highest-priority items currently:

### 🔴 P0 — Close PS Criteria Gaps (blocking "all criteria met")

- [ ] **Climate trend data** — Seed `ClimateRecord` from IMD historical normals or Open-Meteo historical archive
- [ ] **Cyclone/flood alerts** — Integrate RSMC New Delhi bulletins; rainfall threshold + river-basin flood logic
- [ ] **AQI** — Wire up OWM Air Pollution API (same key already in use — trivial add)
- [ ] **Aviation METAR** — Fetch real METAR from `aviationweather.gov` (free, no key)
- [ ] **Agro-advisory depth** — Crop-specific rain/temp thresholds (wheat <35°C, rice standing water, etc.)
- [ ] **Voice E2E test** — Real browser audio recording, fix stuck-red mic UI bug

### 🟡 P1 — Frontend & UX

- [ ] Multi-day forecast cards (7-day view — data already available from Open-Meteo)
- [ ] Web Push notifications (works when browser tab is closed — critical for fishermen)
- [ ] Saved locations (pin 3–5 favourite cities, quick-switch tabs)
- [ ] Offline cached last-known data with clear timestamp
- [ ] Real PWA icon set + Lighthouse audit

### 🟢 P2 — Backend & Infra

- [ ] Top-100 city cache warm-up cron (pre-fetches common queries every 15min)
- [ ] Structured JSON logging for Railway log search
- [ ] Sentry error tracking (free tier)
- [ ] Staging environment on Railway
- [ ] CORS tightened from `*` to specific frontend domain
- [ ] Per-user API key rate limiting (currently global 60/min)
- [ ] Custom domain (remove `*.up.railway.app` for demo credibility)

---

## 👥 Team

Built with ❤️ for **Smart India Hackathon 2026** (Problem Statement SIH26068) by **Team Eloquence**.

> *Six of us, one SIH26068 build.*

---

<table>
<tr>
<td align="center" width="160">
<strong>Astitva Bhardwaj</strong><br/>
<em>Team Lead</em><br/>
<a href="https://www.linkedin.com/in/astitva-bhardwajlu/">🔗 LinkedIn</a>
</td>
<td>
Set the architecture for Sanket and drove it from prototype to a deployed product. Rebuilt the entire frontend on the <strong>shilp-sutra design system</strong>, wired real <strong>Firebase authentication</strong> (Google and email) in place of the earlier mock login, integrated the <strong>Carto basemap</strong> for the live weather map, and manages the <strong>Railway deployment</strong> for both frontend and backend. Kept the team's individual pieces moving toward one shippable app.
</td>
</tr>

<tr>
<td align="center" width="160">
<strong>Harsh Tripathi</strong><br/>
<em>NLP Engineer</em><br/>
<a href="https://www.linkedin.com/in/aaharsh11z/">🔗 LinkedIn</a>
</td>
<td>
Built the <strong>natural-language query pipeline</strong> that turns a plain-language question — in any of 17 supported languages — into a weather answer: <strong>language detection</strong>, <strong>intent classification</strong>, <strong>location extraction</strong>, and the logic that stitches together data from IMD, OWM, and Open-Meteo into one cited response.
</td>
</tr>

<tr>
<td align="center" width="160">
<strong>Ashish Prajapati</strong><br/>
<em>Backend Engineer</em><br/>
<a href="https://www.linkedin.com/in/ashish-kumar-prajapati-6b188937a/">🔗 LinkedIn</a>
</td>
<td>
Built the <strong>FastAPI backend</strong> that every screen in the app calls into: the live weather and AQI routes, the crop advisory and METAR endpoints, the climate-trend archive lookup, and the alert subscription system. Designed the <strong>SQLAlchemy models</strong> (users, sessions, queries, alerts) that back all of it.
</td>
</tr>

<tr>
<td align="center" width="160">
<strong>Kulshreshtha Sharma</strong><br/>
<em>Frontend Engineer</em><br/>
<a href="https://www.linkedin.com/in/kulshrestha-sharma/">🔗 LinkedIn</a>
</td>
<td>
Built out the core app shell screens people actually live in day to day: <strong>chat</strong>, the <strong>saved-cities list</strong>, the <strong>side-by-side city comparison view</strong>, and <strong>alert subscriptions</strong>, plus the shared UI components those screens are built from.
</td>
</tr>

<tr>
<td align="center" width="160">
<strong>Riya Mishra</strong><br/>
<em>DevOps</em><br/>
<a href="https://www.linkedin.com/in/riya-mishra-94162b395/">🔗 LinkedIn</a>
</td>
<td>
Set up the <strong>Docker builds</strong> and <strong>Kubernetes/monitoring configuration</strong> behind the app, and kept the <strong>CI/CD pipeline</strong> reliable so every push actually made it into a working build instead of a broken one.
</td>
</tr>

<tr>
<td align="center" width="160">
<strong>Anirudh Singh</strong><br/>
<em>QA & Testing</em><br/>
<a href="https://www.linkedin.com/in/anirudh-singh-360621236/">🔗 LinkedIn</a>
</td>
<td>
Ran the <strong>test suite and manual QA passes</strong> across the app, catching regressions in the <strong>voice input</strong>, the <strong>onboarding flow</strong>, and the <strong>alert subscription screen</strong> before they reached a build people could actually use.
</td>
</tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Sanket · Built for the Ministry of Earth Sciences · Smart India Hackathon 2026**

<sub>
  Team Eloquence · Real data. Zero hallucination. 17 languages. Built for India. 🇮🇳
</sub>

</div>
