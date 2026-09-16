"""Pydantic schemas for the embeddings API."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .document import CamelModel


class EmbeddingModelOut(CamelModel):
    model: str
    provider: str
    device: str
    dimensions: int | None
    status: str


class EmbeddingPreviewIn(BaseModel):
    document_id: str = Field(alias="documentId")
    chunk_index: int = Field(ge=0, alias="chunkIndex")


class EmbeddingPreviewOut(CamelModel):
    chunk_id: str
    point_id: str
    document_id: str
    model: str
    dimensions: int
    vector_preview: list[float]
    status: str


class QueryEmbeddingIn(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class QueryEmbeddingOut(CamelModel):
    model: str
    dimensions: int
    vector_preview: list[float]
    status: str
