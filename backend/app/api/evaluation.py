from fastapi import APIRouter, HTTPException, Query

from ..schemas.evaluation import (
    DatasetOut,
    EvaluationRunOut,
    RunIn,
)
from ..services import evaluation_service
from ..services.evaluation_service import EvaluationError

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])

_ERROR_STATUS = {
    "dataset_not_found": 404,
    "dataset_invalid": 500,
    "evaluation_document_missing": 409,
    "evaluation_no_resolvable_cases": 409,
    "no_indexed_documents": 409,
    "vector_store_unavailable": 503,
    "embedding_model_unavailable": 503,
    "embedding_failed": 502,
    "not_found": 404,
}


@router.get("/dataset", response_model=DatasetOut)
def get_dataset(name: str = Query(evaluation_service.DATASET_FILE, max_length=80)) -> DatasetOut:
    try:
        dataset = evaluation_service.load_dataset(name)
    except EvaluationError as error:
        raise _to_http(error) from error
    return DatasetOut(
        name=dataset.get("name", name),
        version=int(dataset.get("version", 1)),
        description=str(dataset.get("description", "")),
        document=str(dataset.get("document", "")),
        anchor_note=str(dataset.get("anchor_note", "")),
        total_cases=len(dataset["cases"]),
        cases=dataset["cases"],
    )


@router.get("/datasets")
def list_datasets() -> dict[str, list[str]]:
    return {"datasets": evaluation_service.list_datasets()}


@router.post("/run", response_model=EvaluationRunOut)
def run(body: RunIn) -> EvaluationRunOut:
    try:
        result = evaluation_service.run_evaluation(
            top_k=body.top_k,
            score_threshold=body.score_threshold,
            dataset_name=body.dataset,
            generate_answers=body.generate_answers,
            model=body.model,
            temperature=body.temperature,
        )
    except EvaluationError as error:
        raise _to_http(error) from error
    return EvaluationRunOut(**result)


def _to_http(error: EvaluationError) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, 500),
        detail={"code": error.code, "message": error.message},
    )
