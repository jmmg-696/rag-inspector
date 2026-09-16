from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.documents import router as documents_router

VERSION = "0.2.0"

# Dev origins — the frontend normally talks to /api through the Vite proxy.
DEV_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def create_app() -> FastAPI:
    app = FastAPI(
        title="RAG Inspector API",
        description="Local document ingestion, cleaning and chunking.",
        version=VERSION,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=DEV_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(documents_router)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "version": VERSION}

    return app


app = create_app()
