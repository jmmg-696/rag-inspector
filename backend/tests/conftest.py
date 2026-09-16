from __future__ import annotations

import io

import pymupdf
import pytest
from docx import Document as DocxDocument
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def temp_data_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("RAG_INSPECTOR_DATA_DIR", str(tmp_path / "documents"))


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
