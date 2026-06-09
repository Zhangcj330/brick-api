# brick-api

FastAPI backend for the Brick AI Buyer's Agent. Streams a professional Australian buyer's agent ("Alex") via SSE, driven by Gemini 3.5 Flash on **Vertex AI** with Google Search grounding and 8 Gen UI tool calls.

## Stack

- **FastAPI** — async web framework
- **Gemini 3.5 Flash** (Vertex AI) — LLM + Google Search grounding (no Domain/REA API needed)
- **uv** — dependency management
- **SSE** — native streaming to the Next.js frontend

## Quick start

### Option A — Vertex AI (recommended, uses GCP credits)

```bash
# 1. Install deps
uv sync

# 2. Authenticate with Google Cloud
gcloud auth login admin@thebrickai.com
gcloud config set project property-agent-dev
gcloud auth application-default login   # opens browser, select admin@thebrickai.com

# 3. Copy env and set project
cp .env.example .env
# Edit .env: GOOGLE_CLOUD_PROJECT=property-agent-dev

# 4. Run dev server
uv run uvicorn main:app --reload
```

### Option B — AI Studio API key (fallback)

```bash
# 1. Install deps
uv sync

# 2. Copy env and add your Gemini key
cp .env.example .env
# Edit .env: GEMINI_API_KEY=AIza...
# Leave GOOGLE_CLOUD_PROJECT empty

# 3. Run dev server
uv run uvicorn main:app --reload
```

Server starts at `http://localhost:8000`.

> **How auth works:** If `GOOGLE_CLOUD_PROJECT` is set, the server uses Vertex AI via Application Default Credentials (ADC) and ignores `GEMINI_API_KEY`. If it's empty, it falls back to the AI Studio API key.

## API

### `POST /api/chat`

Streams SSE events for each turn.

**Request**
```json
{
  "messages": [{ "role": "user", "content": "Show me 3BR homes in Surry Hills under $1.5M" }],
  "session_id": "uuid"
}
```

**SSE event types**
| Type | Payload |
|---|---|
| `text_delta` | `{ "content": "..." }` — streamed text chunk |
| `tool_call` | `{ "id", "name", "args" }` — Gen UI component trigger |
| `warning` | `{ "level": "high\|medium", "text": "..." }` — proactive risk alert |
| `sources` | `{ "items": [...] }` — grounding web sources |
| `thinking_done` | `{ "duration": 1.23 }` — data-fetch round complete |
| `error` | `{ "message": "..." }` |
| `done` | `{}` — stream complete |

### `GET /health`

Returns `{ "status": "ok" }`.

## Gen UI tools

Alex calls these to drive the right panel in the frontend:

| Tool | Description |
|---|---|
| `show_property_card` | Property photo, price, bed/bath, warnings |
| `show_map` | Leaflet map with property pins |
| `show_suburb_stats` | Median price, growth, yield, clearance rate |
| `show_affordability` | Loan breakdown, stamp duty, LMI check |
| `show_risk_summary` | Flood, bushfire, heritage, strata risk list |
| `show_street_view` | Google Street View image |
| `show_grants` | First-home buyer grants and concessions |
| `show_comparison` | Side-by-side property comparison |

## Tests

```bash
uv run pytest tests/ -v
```

## Deploy (AWS ECS)

Uses AWS Workload Identity Federation (`aws-wif.json`) to authenticate to Vertex AI without storing any credentials.

Set these environment variables in ECS task definition:
```
GOOGLE_APPLICATION_CREDENTIALS=/app/aws-wif.json
GOOGLE_CLOUD_PROJECT=property-agent-dev
GOOGLE_CLOUD_LOCATION=global
```

## Deploy (Railway)

1. Push to GitHub
2. Connect repo in Railway → auto-detects `railway.json`
3. Set env vars in Railway dashboard:
   - `GOOGLE_CLOUD_PROJECT=property-agent-dev`
   - `GOOGLE_APPLICATION_CREDENTIALS=/app/aws-wif.json`
4. Done — `/health` is the healthcheck path

## Project structure

```
brick-api/
├── main.py              # FastAPI app + CORS
├── routers/
│   └── chat.py          # POST /api/chat SSE endpoint
├── services/
│   ├── gemini.py        # Gemini streamGenerateContent + tool loop
│   ├── enrichments.py   # Vertex AI client + data enrichment helpers
│   └── tools.py         # 8 Gen UI function declarations
├── prompts/
│   └── buyer_agent.py   # Alex system prompt
├── models/
│   └── schemas.py       # Pydantic models
├── aws-wif.json          # AWS → GCP Workload Identity Federation config
└── tests/
    └── test_chat.py     # Smoke tests (mocked Gemini)
```
