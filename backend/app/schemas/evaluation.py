"""Schemas for the Phase 6 evaluation API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from .document import CamelModel


class RunIn(BaseModel):
    top_k: int = Field(default=5, ge=1, le=20, alias="topK")
    score_threshold: float = Field(
        default=0.0, ge=0.0, le=1.0, alias="scoreThreshold"
    )
    dataset: str = Field(default="sample-handbook.json", max_length=80)
    generate_answers: bool = Field(default=False, alias="generateAnswers")
    model: str | None = Field(default=None, max_length=100)
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)

    model_config = {"populate_by_name": True}


class DatasetCaseOut(CamelModel):
    id: str
    question: str
    anchor: str
    tags: list[str] = []
    reference_answer: str = ""


class DatasetOut(CamelModel):
    name: str
    version: int = 1
    description: str = ""
    document: str
    anchor_note: str = ""
    total_cases: int
    cases: list[DatasetCaseOut]


class ExpectedSourceOut(CamelModel):
    document_id: str
    chunk_id: str
    chunk_index: int
    page_start: int
    estimated_tokens: int


class RetrievedItemOut(CamelModel):
    rank: int
    score: float
    chunk_id: str
    chunk_index: int
    page_start: int
    document_id: str
    document_name: str
    text: str
    relevant: bool


class CaseMetricsOut(CamelModel):
    hit_at_k: bool
    recall_at_k: float
    precision_at_k: float
    reciprocal_rank: float
    first_relevant_rank: int | None


class GenerationCaseOut(CamelModel):
    answer: str = ""
    verified_citations: list[str] = []
    unresolved_citations: list[int] = []
    total_citations_detected: int = 0
    model: str = ""
    metrics: dict[str, Any] | None = None
    error_code: str | None = None
    error_message: str | None = None


class CaseResultOut(CamelModel):
    question_id: str
    question: str
    tags: list[str] = []
    reference_answer: str = ""
    skipped: bool
    expected_sources: list[ExpectedSourceOut]
    retrieved: list[RetrievedItemOut]
    metrics: CaseMetricsOut | None
    generation: GenerationCaseOut | None


class DatasetSummaryOut(CamelModel):
    name: str
    total_cases: int
    evaluated_cases: int
    skipped_cases: int


class ConfigurationOut(CamelModel):
    top_k: int
    score_threshold: float
    embedding_model: str
    embedding_dimensions: int | None
    chunk_size: int
    chunk_overlap: int
    document_name: str
    generation_enabled: bool
    llm_model: str | None = None
    temperature: float | None = None


class RetrievalMetricsOut(CamelModel):
    hit_rate_at_k: float
    recall_at_k: float
    precision_at_k: float
    mrr: float


class GenerationMetricsOut(CamelModel):
    generated_answers: int
    failed_answers: int
    citation_coverage: float | None
    valid_citation_rate: float | None
    avg_answer_characters: int | None
    avg_generation_ms: int | None
    avg_completion_tokens: float | None
    avg_tokens_per_second: float | None


class WarningOut(CamelModel):
    question_id: str
    message: str


class EvaluationRunOut(CamelModel):
    run_id: str
    created_at: str
    dataset: DatasetSummaryOut
    configuration: ConfigurationOut
    retrieval_metrics: RetrievalMetricsOut
    generation_metrics: GenerationMetricsOut | None
    warnings: list[WarningOut]
    cases: list[CaseResultOut]
