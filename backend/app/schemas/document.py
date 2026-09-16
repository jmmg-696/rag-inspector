"""Pydantic response schemas.

All API payloads serialize to camelCase so the TypeScript frontend can use
them directly.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class CleaningOut(CamelModel):
    original_characters: int
    cleaned_characters: int
    removed_artifacts: int


class PageOut(CamelModel):
    page: int
    text: str
    characters: int


class DocumentSummaryOut(CamelModel):
    id: str
    name: str
    type: str
    page_count: int
    characters: int
    words: int
    status: str
    chunk_size: int
    chunk_overlap: int
    chunk_count: int
    embedding_count: int = 0
    embedding_version: str = ""
    indexed_at: str = ""
    error_code: str = ""
    error_message: str = ""
    cleaning: CleaningOut
    created_at: str


class DocumentDetailOut(DocumentSummaryOut):
    pages: list[PageOut]


class ChunkOut(CamelModel):
    id: str
    document_id: str
    index: int
    text: str
    page_start: int
    page_end: int
    character_count: int
    estimated_tokens: int


class ChunksResponseOut(CamelModel):
    document_id: str
    chunk_size: int
    chunk_overlap: int
    characters_per_token: int
    total: int
    chunks: list[ChunkOut]


class DeletedOut(CamelModel):
    deleted: bool
