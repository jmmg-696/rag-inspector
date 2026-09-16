"""Deterministic character-window chunking with overlap.

TOKEN APPROXIMATION (deliberate for Phase 2 — a real tokenizer ships with
the embeddings phase):

    1 token ~= 4 characters   (window = chunk_size * 4 characters)

Chunking is fully deterministic: the same (document, chunk_size, overlap)
always produces byte-identical chunks. Windows snap to word boundaries so
words are never split, and every chunk records the pages it covers.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from ..models.document import DocumentPage

CHARS_PER_TOKEN = 4
DEFAULT_CHUNK_SIZE = 512
DEFAULT_OVERLAP = 100
MIN_CHUNK_SIZE = 64
MAX_CHUNK_SIZE = 4096


class ChunkingError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass
class Chunk:
    id: str
    document_id: str
    index: int
    text: str
    page_start: int
    page_end: int
    character_count: int
    estimated_tokens: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def estimate_tokens(characters: int) -> int:
    if characters <= 0:
        return 0
    return (characters + CHARS_PER_TOKEN - 1) // CHARS_PER_TOKEN


def validate_settings(chunk_size: int, overlap: int) -> None:
    if not isinstance(chunk_size, int) or not isinstance(overlap, int):
        raise ChunkingError("invalid_settings", "Chunk size and overlap must be integers.")
    if not MIN_CHUNK_SIZE <= chunk_size <= MAX_CHUNK_SIZE:
        raise ChunkingError(
            "invalid_settings",
            f"Chunk size must be between {MIN_CHUNK_SIZE} and {MAX_CHUNK_SIZE} tokens.",
        )
    if overlap < 0 or overlap >= chunk_size:
        raise ChunkingError(
            "invalid_settings", "Overlap must be between 0 and chunk size - 1."
        )


def chunk_pages(
    document_id: str,
    pages: list[DocumentPage],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> list[Chunk]:
    validate_settings(chunk_size, overlap)

    flat = ""
    boundaries: list[tuple[int, int]] = []  # (page_number, end offset)
    for page in pages:
        if flat:
            flat += "\n\n"
        flat += page.text
        boundaries.append((page.page, len(flat)))

    if not flat.strip():
        return []

    window = chunk_size * CHARS_PER_TOKEN
    step = (chunk_size - overlap) * CHARS_PER_TOKEN

    def page_at(offset: int) -> int:
        for page_number, end in boundaries:
            if offset < end:
                return page_number
        return boundaries[-1][0]

    def snap_forward(text: str, position: int) -> int:
        # move past the rest of the current word, then past whitespace
        while position < len(text) and not text[position].isspace():
            position += 1
        while position < len(text) and text[position].isspace():
            position += 1
        return position

    chunks: list[Chunk] = []
    position = 0
    while position < len(flat) and flat[position].isspace():
        position += 1
    index = 0

    while position < len(flat):
        end = position + window
        if end < len(flat):
            # never split a word: extend to the next whitespace boundary
            while end < len(flat) and not flat[end].isspace():
                end += 1
        end = min(end, len(flat))
        text = flat[position:end]

        chunks.append(
            Chunk(
                id=f"chunk-{index}",
                document_id=document_id,
                index=index,
                text=text,
                page_start=page_at(position),
                page_end=page_at(max(position, end - 1)),
                character_count=len(text),
                estimated_tokens=estimate_tokens(len(text)),
            )
        )
        index += 1

        next_position = snap_forward(flat, position + step)
        position = next_position if next_position > position else end

    return chunks
