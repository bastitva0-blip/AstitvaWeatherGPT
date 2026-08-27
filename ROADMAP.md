# WeatherGPT — Production Roadmap

SIH26068 | Status as of 2026-08-28

---

## Part 1 — PS Criteria Audit (honest, current state)

| PS Requirement | Status | Gap |
|---|---|---|
| Real-time weather retrieval | Done — fact-checked twice against live OpenWeatherMap | — |
| NL query understanding | Done — global, tested | — |
| NWP (GFS) integration | Done — real via Open-Meteo | — |
| Location-based advisory | Done — global, tested (Paris, London, Tokyo, remote India towns) | — |
| Multilingual | Done — real LLM translation | Latency ~7s for non-English (LLM translate overhead) |
| Voice interaction | Partial — faster-whisper installed | Never end-to-end tested with real audio in browser. Mic button had a stuck-red UI bug, unfixed |
| Extreme weather alerts/warnings | Partial — WebSocket+Redis built | Cyclone warning is always `False` — no real cyclone data source. Flood warning not implemented at all |
| Climate trend/historical | Partial — code exists | `ClimateRecord` table is empty — every trend query returns "no data" in production right now |
| Agro-advisory (farmer use case) | Partial — superficial | Just extracts crop_type keyword, no real advisory logic/thresholds |
| Aviation briefing | Partial — built | METAR/QNH never actually fetched, ICAO code extracted but unused downstream |
| Smart city/urban monitoring | Partial — built | No AQI data source integrated at all — intent detected, nothing real returned |
| Scalability | Partial | Single Railway instance, no autoscaling active (k8s manifests exist but unused on Railway) |
| PWA/mobile | Partial — built | Never Lighthouse-tested, no real icons (placeholder) |

**5 real gaps block "all criteria met"**: cyclone/flood alerts, climate trend data, AQI/urban, voice E2E test, agro-advisory depth. Fix these before feature expansion — they're explicitly named in the PS.

---

## Part 2 — Full Feature/Section/Idea List (production roadmap)

### A. Close the criteria gaps (do first)

1. **Climate trend** — seed `ClimateRecord` from IMD's public historical normals (or India Data Portal CSV), or fallback trend calc from Open-Meteo's historical API (`archive-api.open-meteo.com`, free, real data, no key)
2. **Cyclone/flood alerts** — integrate RSMC New Delhi cyclone bulletins (scrape, public HTML) or NDMA's alert feed; flood = rainfall_mm threshold + river-basin lookup (harder, maybe v2)
3. **AQI** — OpenWeatherMap has a free Air Pollution API (`/data/2.5/air_pollution`), same key already in use — trivial add
4. **Aviation** — fetch real METAR from `aviationweather.gov/api/data/metar?ids={ICAO}&format=json` (free, no key, real data)
5. **Agro-advisory** — crop-specific rain/temp thresholds (e.g. wheat needs <35°C, rice needs standing water) — small rules table, IMD publishes these
6. **Voice E2E test** — record real audio in browser, verify transcription, fix the mic button UI bug
7. **PWA** — real icon set, Lighthouse audit, offline fallback page

### B. Frontend sections (new pages/panels)

- **Dashboard/Home** — replace bare chat-first landing with a location-based snapshot card (current temp/condition/alerts) before the user even types, using geolocation or last-searched city
- **Map view** — Leaflet/Mapbox showing cyclone tracks, coastal fishing zones, rainfall heatmap overlay (big visual win for judges)
- **Saved locations** — pin 3-5 favorite places, quick-switch tabs (farmer checking their village daily)
- **Compare view** — side-by-side weather for 2+ locations (useful for traders/logistics)
- **Offline mode indicator** — PWA should show cached last-known data with a clear "offline, showing cached data from Xmin ago" banner
- **Onboarding/first-run** — language picker + location permission ask, one-time
- **About/Sources page** — list every real data source (OWM, Open-Meteo, GFS, INCOIS) — builds judge trust in "zero hallucination" claim

### C. Notifications

- **Push notifications** (Web Push API) for subscribed alerts — currently only WebSocket (requires tab open); Web Push works even when app closed, critical for rural fishermen who won't keep a browser tab open
- **SMS/WhatsApp fallback** — Twilio integration is stubbed in requirements.txt but never wired; genuinely valuable for low-connectivity rural areas (PS explicitly values rural accessibility)
- **Daily digest** — opt-in "7am forecast for your saved location" push, not just threshold alerts
- **Severity-tiered notification style** — advisory=toast, watch=banner, warning=full-screen interrupt + sound (cyclone/fishermen "do not go to sea" should be impossible to miss)

### D. Backend/data features

- **Historical query cache warm-up** — cron pre-fetches top-100 Indian cities every 15min (spec already mentions `TOP_CITIES_CACHE`, never implemented) — makes common queries instant
- **Multi-day forecast** — currently single-day; Open-Meteo already returns 7-16 days, just not surfaced
- **Satellite imagery** — INSAT-3D cloud imagery embed (public IMD/ISRO links) for visual credibility
- **Rate limiting per user** (not just global) — currently global 60/min, should be per-API-key
- **Query history/analytics** — already saving `Query` rows; build an admin dashboard reading them (most-asked locations, intent distribution) — good demo material
- **Feedback loop** — thumbs up/down on answers, feeds `HallucinationLog` table (already exists, unused)

### E. Production infra

- **Real Postgres backups** — Railway has automatic backups on paid plans, verify enabled
- **Structured logging** — current logs are plain text; switch to JSON logs for easier Railway log search
- **Error tracking** — Sentry free tier, catches the exact kind of bugs found via manual testing
- **Staging environment** — Railway supports a second environment; test before prod push instead of pushing straight to prod
- **CI test on PR, not just push** — already have `pull_request` trigger in workflow, verify it actually blocks bad merges
- **Domain** — custom domain instead of `*.up.railway.app` for the demo (more professional for judges)
- **API docs** — FastAPI auto-generates `/docs`, just needs response examples added for judge readability

### F. Security/robustness

- **Input length limits** — no cap on `message` length currently, could abuse LLM token costs
- **Prompt injection guard** — user message goes straight into LLM context; add a basic check against instructions like "ignore previous instructions"
- **API key rotation** — currently one shared `test-key`, need per-user keys before any real launch
- **CORS tightened** — currently `allow_origins=["*"]`, fine for demo, must restrict before production

---

## Decision log

- 2026-08-28: Decided to fix Part A (criteria gaps) before B-F feature expansion.
