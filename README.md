# AstitvaWeatherGPT

WeatherGPT — Conversational AI for Weather Forecasting, Alerts, and Climate Information.
Smart India Hackathon 2026, PS SIH26068 (Ministry of Earth Sciences / IMD).

## Live deployment (Railway)

- Backend API: https://backend-production-c6aa1.up.railway.app (`/health`, `/docs`)
- Frontend PWA: https://frontend-production-9606.up.railway.app

Pushing to `main` auto-deploys both `backend/` and `frontend/` via Railway's
GitHub integration (Dockerfile builds, config in `backend/railway.json` and
`frontend/railway.json`).

## Local development

See `backend/requirements.txt` and `frontend/package.json` for dependencies,
and `.env.example` for required environment variables (NVIDIA NIM LLM,
OpenWeatherMap, Postgres, Redis).
