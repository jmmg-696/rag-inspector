"""Schemas for RAG generation."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from .document import CamelModel
from .retrieval import RetrievalHitOut


class GenerationIn(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    top_k: int = Field(default=5, ge=1, le=20, alias="topK")
    score_threshold: float = Field(
        default=0.0, ge=0.0, le=1.0, alias="scoreThreshold"
    )
    document_id: str | None = Field(default=None, alias="documentId")
    model: str | None = Field(default=None, max_length=100)
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)

    model_config = {"populate_by_name": True}


class SourcePayloadOut(CamelModel):
    source_id: str
    document_id: str
    document_name: str
    chunk_id: str
    chunk_index: int
    page_start: int
    page_end: int
    score: float
    estimated_tokens: int
    text: str


class ContextOut(CamelModel):
    retrieved_chunks: int
    included_chunks: int
    estimated_tokens: int
    sources: list[SourcePayloadOut]


class RetrievalSummaryOut(CamelModel):
    top_k: int
    score_threshold: float
    filtered_document_id: str | None
    corpus_size: int
    total_results: int
    results: list[RetrievalHitOut]
    retrieval_ms: int


class PromptOut(CamelModel):
    system: str
    context: str
    user: str
    full_prompt: str


class CitationsOut(CamelModel):
    verified: list[str]
    unresolved: list[int]


class GenerationOut(CamelModel):
    query: str
    model: str
    temperature: float
    retrieval: RetrievalSummaryOut
    context: ContextOut
    prompt: PromptOut
    answer: str | None
    citations: CitationsOut
    generation_metrics: dict[str, Any] | None


class LlmStatusOut(CamelModel):
    available: bool
    base_url: str
    configured_model: str
    model_available: bool
    models: list[str]


class LlmModelsOut(CamelModel):
    models: list[str]
