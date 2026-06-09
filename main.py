import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import chat

load_dotenv()

# When using Vertex AI (GCP credits), ensure GEMINI_API_KEY is not in the
# environment — the Interactions SDK lazily reads it and would override ADC auth.
if os.environ.get("GOOGLE_CLOUD_PROJECT"):
    os.environ.pop("GEMINI_API_KEY", None)

try:
    # Initialize Langfuse client first — this registers its OTel TracerProvider.
    # GoogleGenAIInstrumentor must be called AFTER so it picks up that provider.
    from langfuse import get_client as _lf_init
    _lf_init()
    from openinference.instrumentation.google_genai import GoogleGenAIInstrumentor
    GoogleGenAIInstrumentor().instrument()
except Exception:
    pass

app = FastAPI(title="Brick API", version="0.1.0")

allowed_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGIN", "http://localhost:3000").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)


@app.get("/")
async def root():
    return {"status": "ok"}


@app.get("/health")
async def health():
    return {"status": "ok"}
