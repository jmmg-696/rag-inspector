from __future__ import annotations

import io
import uuid

import pymupdf
import pytest
from docx import Document as DocxDocument
from fastapi.testclient import TestClient

# Phase 3 services must run hermetically in tests: fake deterministic
# embedder + in-process Qdrant. Set before app modules read settings.
# Ollama points at a closed port — generation tests monkeypatch the
# service layer, nothing ever talks to a real LLM.
import os

os.environ["RAG_INSPECTOR_EMBEDDING_BACKEND"] = "fake"
os.environ["RAG_INSPECTOR_QDRANT_URL"] = ":memory:"
os.environ["RAG_INSPECTOR_FAKE_EMBEDDING_DIMS"] = "16"
os.environ["OLLAMA_BASE_URL"] = "http://127.0.0.1:9"
os.environ["OLLAMA_MODEL"] = "fake-model:test"

from app import settings  # noqa: E402
from app.services import embedding_service, vector_store_service  # noqa: E402


@pytest.fixture(autouse=True)
def isolated_services(tmp_path, monkeypatch):
    monkeypatch.setenv("RAG_INSPECTOR_DATA_DIR", str(tmp_path / "documents"))
    monkeypatch.setattr(settings, "QDRANT_COLLECTION", f"test_{uuid.uuid4().hex[:8]}")
    vector_store_service.reset_client_for_tests()
    embedding_service.reset_for_tests()
    yield
    vector_store_service.reset_client_for_tests()


@pytest.fixture
def client() -> TestClient:
    from app.main import app

    return TestClient(app)


def make_pdf(pages: list[str]) -> bytes:
    document = pymupdf.open()
    for text in pages:
        page = document.new_page()
        page.insert_textbox(page.rect, text, fontsize=10)
    data = document.tobytes()
    document.close()
    return data


def make_docx(paragraphs: list[str]) -> bytes:
    document = DocxDocument()
    for paragraph in paragraphs:
        document.add_paragraph(paragraph)
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


LOREM_SENTENCE = "The approval process requires a review from the responsible area."
