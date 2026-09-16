from __future__ import annotations

import math

from .conftest import LOREM_SENTENCE, make_docx, make_pdf


def upload(client, content: bytes, filename: str, **form):
    data = {"chunk_size": "512", "chunk_overlap": "100", **{k: str(v) for k, v in form.items()}}
    return client.post(
        "/api/documents/ingest",
        files={"file": (filename, content, "application/octet-stream")},
        data=data,
    )


def long_text(pages: int = 1, sentences: int = 120) -> bytes:
    blocks = []
    for _ in range(pages if pages == 1 else 1):
        blocks.append(" ".join([LOREM_SENTENCE] * sentences))
    return "\n\n".join(blocks).encode("utf-8")


class TestHealth:
    def test_health_ok(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestExtraction:
    def test_txt_ingest(self, client):
        response = upload(client, long_text(), "guide.txt")
        assert response.status_code == 200
        body = response.json()
        assert body["type"] == "txt"
        assert body["pageCount"] == 1
        assert body["characters"] > 1000
        assert body["words"] > 100
        assert body["status"] == "ready"
        assert body["chunkCount"] > 0
        assert body["cleaning"]["originalCharacters"] >= body["cleaning"]["cleanedCharacters"]

    def test_markdown_ingest(self, client):
        content = "# Handbook\n\n" + " ".join([LOREM_SENTENCE] * 80)
        response = upload(client, content.encode("utf-8"), "handbook.md")
        assert response.status_code == 200
        assert response.json()["type"] == "md"

    def test_pdf_pages_preserved(self, client):
        pdf = make_pdf(
            [
                "ALPHA marker first page content. " + LOREM_SENTENCE * 20,
                "BETA marker second page content. " + LOREM_SENTENCE * 20,
            ]
        )
        response = upload(client, pdf, "manual.pdf")
        assert response.status_code == 200
        body = response.json()
        assert body["type"] == "pdf"
        assert body["pageCount"] == 2

        detail = client.get(f"/api/documents/{body['id']}").json()
        assert "ALPHA" in detail["pages"][0]["text"]
        assert "BETA" in detail["pages"][1]["text"]
        assert detail["pages"][0]["page"] == 1
        assert detail["pages"][1]["page"] == 2

    def test_docx_paragraphs(self, client):
        docx = make_docx([LOREM_SENTENCE, "A second paragraph about escalation.", LOREM_SENTENCE])
        response = upload(client, docx, "procedures.docx")
        assert response.status_code == 200
        detail = client.get(f"/api/documents/{response.json()['id']}").json()
        assert "escalation" in detail["pages"][0]["text"]
        assert "\n\n" in detail["pages"][0]["text"]


class TestValidationErrors:
    def test_unsupported_type(self, client):
        response = upload(client, b"whatever", "malware.exe")
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "unsupported_type"

    def test_empty_text_file(self, client):
        response = upload(client, b"   \n\n   \t  ", "blank.txt")
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "empty_document"

    def test_zero_byte_file(self, client):
        response = upload(client, b"", "empty.txt")
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "empty_document"

    def test_invalid_pdf_bytes(self, client):
        response = upload(client, b"%PDF-1.4 not really a pdf", "fake.pdf")
        assert response.status_code == 400
        assert response.json()["detail"]["code"] in {"invalid_file", "empty_document"}

    def test_too_large(self, client, monkeypatch):
        from app.services import extraction_service

        monkeypatch.setattr(extraction_service, "MAX_FILE_SIZE", 64)
        response = upload(client, b"x" * 100, "big.txt")
        assert response.status_code == 413
        assert response.json()["detail"]["code"] == "too_large"


class TestChunks:
    def _ingest(self, client, sentences: int = 300):
        content = " ".join([LOREM_SENTENCE] * sentences).encode("utf-8")
        body = upload(client, content, "chunks.txt").json()
        return body["id"]

    def test_defaults(self, client):
        doc_id = self._ingest(client)
        response = client.get(f"/api/documents/{doc_id}/chunks")
        assert response.status_code == 200
        body = response.json()
        assert body["chunkSize"] == 512
        assert body["chunkOverlap"] == 100
        assert body["charactersPerToken"] == 4
        assert body["total"] == len(body["chunks"]) > 1

        first = body["chunks"][0]
        assert first["index"] == 0
        assert first["pageStart"] == 1 and first["pageEnd"] == 1
        assert first["characterCount"] == len(first["text"])
        assert first["estimatedTokens"] == math.ceil(
            first["characterCount"] / body["charactersPerToken"]
        )

    def test_deterministic(self, client):
        doc_id = self._ingest(client)
        one = client.get(f"/api/documents/{doc_id}/chunks").json()
        two = client.get(f"/api/documents/{doc_id}/chunks").json()
        assert one == two

    def test_smaller_size_more_chunks(self, client):
        doc_id = self._ingest(client)
        large = client.get(
            f"/api/documents/{doc_id}/chunks", params={"chunk_size": 1024, "chunk_overlap": 0}
        ).json()
        small = client.get(
            f"/api/documents/{doc_id}/chunks", params={"chunk_size": 128, "chunk_overlap": 0}
        ).json()
        assert small["total"] > large["total"]

    def test_overlap_repeats_text(self, client):
        doc_id = self._ingest(client)
        with_overlap = client.get(
            f"/api/documents/{doc_id}/chunks", params={"chunk_size": 128, "chunk_overlap": 64}
        ).json()["chunks"]
        without = client.get(
            f"/api/documents/{doc_id}/chunks", params={"chunk_size": 128, "chunk_overlap": 0}
        ).json()["chunks"]
        assert with_overlap[1]["text"][:20] in with_overlap[0]["text"]
        assert len(with_overlap) > len(without)

    def test_invalid_overlap_rejected(self, client):
        doc_id = self._ingest(client, sentences=50)
        response = client.get(
            f"/api/documents/{doc_id}/chunks",
            params={"chunk_size": 128, "chunk_overlap": 500},
        )
        assert response.status_code == 422
        assert response.json()["detail"]["code"] == "invalid_settings"

    def test_chunk_size_bounds(self, client):
        doc_id = self._ingest(client, sentences=50)
        response = client.get(
            f"/api/documents/{doc_id}/chunks", params={"chunk_size": 8}
        )
        assert response.status_code == 422


class TestDocumentLifecycle:
    def test_list_get_delete(self, client):
        body = upload(client, long_text(), "lifecycle.txt").json()
        doc_id = body["id"]
        listed = client.get("/api/documents").json()
        assert any(doc["id"] == doc_id for doc in listed)

        deleted = client.delete(f"/api/documents/{doc_id}")
        assert deleted.status_code == 200
        assert client.get(f"/api/documents/{doc_id}").status_code == 404

    def test_not_found_codes(self, client):
        missing = client.get("/api/documents/doc-aaaaaaaaaa")
        assert missing.status_code == 404
        assert missing.json()["detail"]["code"] == "not_found"

    def test_path_traversal_rejected(self, client):
        response = client.get("/api/documents/..%2F..%2Fetc")
        assert response.status_code in {404, 422}
