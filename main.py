import base64
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


def _setup_observability() -> None:
    """Wire GoogleGenAIInstrumentor → Langfuse via OTLP when env vars are set.

    GoogleGenAIInstrumentor (NOT VertexAIInstrumentor) patches google-genai's
    AsyncModels.generate_content_stream, which is what we actually call.
    Each round automatically becomes a child LLM generation span with
    input messages, output, token counts, and tool declarations captured.
    """
    pk = os.environ.get("LANGFUSE_PUBLIC_KEY", "")
    sk = os.environ.get("LANGFUSE_SECRET_KEY", "")
    host = os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com")
    if not (pk and sk):
        return
    try:
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from openinference.instrumentation.google_genai import GoogleGenAIInstrumentor

        auth = base64.b64encode(f"{pk}:{sk}".encode()).decode()
        provider = TracerProvider()
        provider.add_span_processor(
            BatchSpanProcessor(
                OTLPSpanExporter(
                    endpoint=f"{host}/api/public/otel/v1/traces",
                    headers={"Authorization": f"Basic {auth}"},
                )
            )
        )
        GoogleGenAIInstrumentor().instrument(tracer_provider=provider)
    except Exception as exc:
        print(f"[observability] setup failed: {exc}")


_setup_observability()

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
