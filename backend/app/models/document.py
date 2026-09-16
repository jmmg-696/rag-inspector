"""Domain models for ingested documents.

Pure dataclasses — persistence lives in the service layer.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class DocumentPage:
    page: int
    text: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "DocumentPage":
        return DocumentPage(page=int(data["page"]), text=str(data["text"]))


@dataclass
class CleaningStats:
    original_characters: int
    cleaned_characters: int
    removed_artifacts: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "CleaningStats":
        return CleaningStats(
            original_characters=int(data["original_characters"]),
            cleaned_characters=int(data["cleaned_characters"]),
            removed_artifacts=int(data["removed_artifacts"]),
        )


@dataclass
class StoredDocument:
    id: str
    name: str
    type: str
    pages: list[DocumentPage] = field(default_factory=list)
    characters: int = 0
    words: int = 0
    status: str = "ready"
    created_at: str = ""
    chunk_size: int = 512
    chunk_overlap: int = 100
    chunk_count: int = 0
    cleaning: CleaningStats = field(
        default_factory=lambda: CleaningStats(0, 0, 0)
    )

    @property
    def full_text(self) -> str:
        return "\n\n".join(page.text for page in self.pages)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "pages": [page.to_dict() for page in self.pages],
            "characters": self.characters,
            "words": self.words,
            "status": self.status,
            "created_at": self.created_at,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "chunk_count": self.chunk_count,
            "cleaning": self.cleaning.to_dict(),
        }

    @staticmethod
    def from_dict(data: dict[str, Any]) -> "StoredDocument":
        return StoredDocument(
            id=str(data["id"]),
            name=str(data["name"]),
            type=str(data["type"]),
            pages=[DocumentPage.from_dict(p) for p in data.get("pages", [])],
            characters=int(data.get("characters", 0)),
            words=int(data.get("words", 0)),
            status=str(data.get("status", "ready")),
            created_at=str(data.get("created_at", "")),
            chunk_size=int(data.get("chunk_size", 512)),
            chunk_overlap=int(data.get("chunk_overlap", 100)),
            chunk_count=int(data.get("chunk_count", 0)),
            cleaning=CleaningStats.from_dict(
                data.get("cleaning", {})
                or {"original_characters": 0, "cleaned_characters": 0, "removed_artifacts": 0}
            ),
        )
