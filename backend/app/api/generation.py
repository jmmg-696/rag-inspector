import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..schemas.generation import GenerationIn, GenerationOut
from ..services import generation_service
from ..services.generation_service import GenerationError

router = APIRouter(prefix="/api/generation", tags=["generation"])

_ERROR_STATUS = {
    "llm_unavailable": 503,
    "llm_model_not_found": 404,
    "llm_timeout": 504,
    "generation_failed": 502,
    "no_indexed_documents": 409,
    "invalid_temperature": 422,
    "vector_store_unavailable": 503,
    "collection_mismatch": 503,
    "embedding_model_unavailable": 503,
    "embedding_failed": 502,
    "not_found": 404,
}


def _to_http(error: Exception) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, 502),
        detail={"code": error.code, "message": error.message},
    )


@router.post("/generate", response_model=GenerationOut)
def generate(body: GenerationIn) -> GenerationOut:
    try:
        result = generation_service.run(
            query=body.query,
            top_k=body.top_k,
            score_threshold=body.score_threshold,
            document_id=body.document_id,
            model=body.model,
            temperature=body.temperature,
        )
    except GenerationError as error:
        raise _to_http(error) from error
    return GenerationOut(**result)


@router.post("/stream")
def generate_stream(body: GenerationIn) -> StreamingResponse:
    """NDJSON event stream: stage | retrieval | token | result | error.

    Every stage event is emitted when the backend actually reaches that
    phase — no simulated progress.
    """

    def events():
        try:
            for event in generation_service.run_stream(
                query=body.query,
                top_k=body.top_k,
                score_threshold=body.score_threshold,
                document_id=body.document_id,
                model=body.model,
                temperature=body.temperature,
            ):
                if event["type"] == "result":
                    # serialize through the same schema as /generate, so the
                    # stream payload is camelCase-identical
                    event = {
                        **event,
                        "payload": GenerationOut(
                            **event["payload"]
                        ).model_dump(by_alias=True),
                    }
                yield json.dumps(event, ensure_ascii=False) + "\n"
        except GenerationError as error:
            payload = {"type": "error", "code": error.code, "message": error.message}
            yield json.dumps(payload, ensure_ascii=False) + "\n"

    return StreamingResponse(events(), media_type="application/x-ndjson")
