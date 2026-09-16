from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.documents import router as documents_router
from .api.embeddings import router as embeddings_router
from .api.vectors import router as vectors_router
from .services import embedding_service, vector_store_service

VERSION = "0.3.0"

# Dev origins — the frontend normally talks to /api through the Vite proxy.
DEV_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def create_app() -> FastAPI:
    app = FastAPI(
        title="RAG Inspector API",
        description=(
            "Local document ingestion, cleaning, chunking, embeddings "
            "and Qdrant vector storage."
        ),
        version=VERSION,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=DEV_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(documents_router)
    app.include_router(embeddings_router)
    app.include_router(vectors_router)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {
            "api": "ok",
            "qdrant": "ok" if vector_store_service.health() else "unavailable",
            "embedding_model": embedding_service.status(),
        }

    return app


app = create_app()
