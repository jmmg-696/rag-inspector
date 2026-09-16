"""Pydantic schemas for the vector store API."""

from __future__ import annotations

from .document import CamelModel


class VectorStatusOut(CamelModel):
    connected: bool
    collection: str
    vectors: int = 0
    dimensions: int | None = None
    distance: str = "Cosine"
    error_code: str = ""


class VectorStatsOut(CamelModel):
    vectors: int
    dimensions: int | None
    documents: int
    total_chunks: int
    embedded_chunks: int
    indexed_percent: int
    average_chunks_per_document: float


class VectorPointOut(CamelModel):
    id: str
    document_id: str
    document_name: str
    chunk_id: str
    chunk_index: int
    page_start: int
    page_end: int
    estimated_tokens: int


class VectorPointListOut(CamelModel):
    total: int
    points: list[VectorPointOut]


class VectorDetailOut(CamelModel):
    id: str
    document_id: str
    document_name: str
    chunk_id: str
    chunk_index: int
    page_start: int
    page_end: int
    estimated_tokens: int
    text: str
    dimensions: int
    vector: list[float]


class SpacePointOut(CamelModel):
    point_id: str
    x: float
    y: float
    document_id: str
    document_name: str
    chunk_index: int
    page_start: int


class SemanticSpaceOut(CamelModel):
    method: str
    dimensions: int
    points: list[SpacePointOut]
