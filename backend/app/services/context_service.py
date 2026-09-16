"""Context construction: ranked chunks → bounded, source-labelled blocks.

Whole chunks are included in rank order while they fit the token budget
(approximated tokens, same 4 chars/token rule used by the chunker). A
chunk that does not fit is skipped — never cut in half. Which chunks
made it is reported, so the UI can be honest about truncation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .. import settings


@dataclass
class SourceBlock:
    source_id: str  # SOURCE_1 … SOURCE_n — stable per run, rank-ordered
    number: int
    document_id: str
    document_name: str
    chunk_id: str
    chunk_index: int
    page_start: int
    page_end: int
    score: float
    estimated_tokens: int
    text: str

    def to_payload(self) -> dict[str, Any]:
        return {
            "source_id": self.source_id,
            "document_id": self.document_id,
            "document_name": self.document_name,
            "chunk_id": self.chunk_id,
            "chunk_index": self.chunk_index,
            "page_start": self.page_start,
            "page_end": self.page_end,
            "score": self.score,
            "estimated_tokens": self.estimated_tokens,
            "text": self.text,
        }


@dataclass
class ContextResult:
    blocks: list[SourceBlock] = field(default_factory=list)
    retrieved_chunks: int = 0
    included_chunks: int = 0
    estimated_tokens: int = 0

    @property
    def is_empty(self) -> bool:
        return not self.blocks

    def text(self) -> str:
        return "\n\n".join(_block_text(block) for block in self.blocks)


def _block_text(block: SourceBlock) -> str:
    location = (
        f"Page: {block.page_start}"
        if block.page_start == block.page_end
        else f"Pages: {block.page_start}-{block.page_end}"
    )
    return (
        f"[{block.source_id}]\n"
        f"Document: {block.document_name}\n"
        f"Chunk: {block.chunk_index} · {location}\n"
        f"{block.text}"
    )


def build_context(
    hits: list[dict[str, Any]],
    max_context_tokens: int | None = None,
) -> ContextResult:
    budget = max_context_tokens or settings.RAG_MAX_CONTEXT_TOKENS
    result = ContextResult(retrieved_chunks=len(hits))
    used = 0
    for index, hit in enumerate(hits, start=1):
        estimated = int(hit.get("estimated_tokens", 0)) or (
            len(str(hit.get("text", ""))) // 4
        )
        if used + estimated > budget and result.blocks:
            continue  # skip whole chunks; never truncate mid-chunk
        block = SourceBlock(
            source_id=f"SOURCE_{index}",
            number=index,
            document_id=str(hit.get("document_id", "")),
            document_name=str(hit.get("document_name", "")),
            chunk_id=str(hit.get("chunk_id", "")),
            chunk_index=int(hit.get("chunk_index", index - 1)),
            page_start=int(hit.get("page_start", 0)),
            page_end=int(hit.get("page_end", 0)),
            score=float(hit.get("score", 0.0)),
            estimated_tokens=estimated,
            text=str(hit.get("text", "")),
        )
        result.blocks.append(block)
        used += estimated
    result.included_chunks = len(result.blocks)
    result.estimated_tokens = used
    return result
