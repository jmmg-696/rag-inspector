"""Schemas for semantic retrieval."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .document import CamelModel


class RetrievalSearchIn(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    top_k: int = Field(default=5, ge=1, le=20, alias="topK")
    score_threshold: float = Field(default=0.0, ge=0.0, le=1.0, alias="scoreThreshold")
    document_id: str | None = Field(default=None, alias="documentId")
    include_embedding: bool = Field(default=False, alias="includeEmbedding")

    model_config = {"populate_by_name": True}


class RetrievalHitOut(CamelModel):
    rank: int
    score: float
    point_id: str
    chunk_id: str
    document_id: str
    document_name: str
    chunk_index: int
    page_start: int
    page_end: int
    estimated_tokens: int
    text: str


class QueryEmbeddingMetaOut(CamelModel):
    model: str
    dimensions: int
    vector: list[float] | None = None


class RetrievalSearchOut(CamelModel):
    query: str
    query_embedding: QueryEmbeddingMetaOut
    results: list[RetrievalHitOut]
    total_results: int
    corpus_size: int
    top_k: int
    score_threshold: float
    filtered_document_id: str | None = None


class RetrievalSpacePointOut(CamelModel):
    point_id: str
    x: float
    y: float
    document_id: str
    document_name: str
    chunk_index: int
    page_start: int
    retrieved: bool = False
    score: float | None = None


class RetrievalSpaceQueryOut(CamelModel):
    x: float
    y: float


class RetrievalSpaceOut(CamelModel):
    method: str
    dimensions: int
    model: str
    points: list[RetrievalSpacePointOut]
    query: RetrievalSpaceQueryOut | None = None
