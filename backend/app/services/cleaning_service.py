"""Light document cleaning.

Removes obvious extraction artifacts (whitespace runs, repeated blank
lines, broken spacing) WITHOUT touching the actual content — extraction
artifacts are formatting noise, not meaning.
"""

from __future__ import annotations

import re

from ..models.document import CleaningStats, DocumentPage

_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\r\n?"), "\n"),          # normalize line endings
    (re.compile(r"[\u00ad\u200b\ufeff]"), ""),  # soft hyphens / zero-width chars
    (re.compile(r"[\u00a0\u2000-\u200a]"), " "),  # exotic spaces → plain space
    (re.compile(r"[ \t]{2,}"), " "),       # collapse horizontal runs
    (re.compile(r" +\n"), "\n"),           # trailing spaces before newline
    (re.compile(r"\n{3,}"), "\n\n"),       # max one blank line between blocks
]


def clean_text(text: str) -> tuple[str, int]:
    """Clean a text block and return (cleaned_text, artifact_count)."""
    artifacts = 0
    cleaned = text
    for pattern, replacement in _PATTERNS:
        cleaned, count = pattern.subn(replacement, cleaned)
        artifacts += count
    return cleaned.strip(), artifacts


def clean_pages(pages: list[DocumentPage]) -> tuple[list[DocumentPage], CleaningStats]:
    original = sum(len(page.text) for page in pages)
    artifacts = 0
    cleaned_pages: list[DocumentPage] = []
    for page in pages:
        text, count = clean_text(page.text)
        artifacts += count
        cleaned_pages.append(DocumentPage(page=page.page, text=text))
    cleaned_total = sum(len(page.text) for page in cleaned_pages)
    return cleaned_pages, CleaningStats(
        original_characters=original,
        cleaned_characters=cleaned_total,
        removed_artifacts=artifacts,
    )
