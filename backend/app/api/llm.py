from fastapi import APIRouter, HTTPException

from ..schemas.generation import LlmModelsOut, LlmStatusOut
from ..services import ollama_service
from ..services.ollama_service import OllamaError

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.get("/status", response_model=LlmStatusOut)
def llm_status() -> LlmStatusOut:
    return LlmStatusOut(**ollama_service.status())


@router.get("/models", response_model=LlmModelsOut)
def llm_models() -> LlmModelsOut:
    try:
        return LlmModelsOut(models=ollama_service.list_models())
    except OllamaError as error:
        raise HTTPException(
            status_code=503,
            detail={"code": error.code, "message": error.message},
        ) from error
