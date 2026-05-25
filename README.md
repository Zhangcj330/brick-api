# brick-api

FastAPI backend for the Brick AI Buyer's Agent. Streams a professional Australian buyer's agent ("Alex") via SSE, driven by Gemini 2.5 Flash with Google Search grounding and 8 Gen UI tool calls.

## Stack

- **FastAPI** — async web framework
- **Gemini 2.5 Flash** — LLM + Google Search grounding (no Domain/REA API needed)
- **uv** — dependency management
- **SSE** — native streaming to the Next.js frontend

## Quick start

```bash
# 1. Copy env and add your Gemini key
cp .env.example .env
# Edit .env: GEMINI_API_KEY=AIza...

# 2. Install deps
uv sync

# 3. Run dev server
uv run uvicorn main:app --reload
```

Server starts at `http://localhost:8000`.

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

## Deploy (Railway)

1. Push to GitHub
2. Connect repo in Railway → auto-detects `railway.json`
3. Set env var `GEMINI_API_KEY` in Railway dashboard
4. Done — `/health` is the healthcheck path

## Project structure

```
brick-api/
├── main.py              # FastAPI app + CORS
├── routers/
│   └── chat.py          # POST /api/chat SSE endpoint
├── services/
│   ├── gemini.py        # Gemini streaming + tool call parsing
│   └── tools.py         # 8 Gen UI function declarations
├── prompts/
│   └── buyer_agent.py   # Alex system prompt
├── models/
│   └── schemas.py       # Pydantic models
└── tests/
    └── test_chat.py     # Smoke tests (mocked Gemini)
```
