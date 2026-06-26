from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.query import QueryRequest, QueryResponse
from app.api.dependencies import get_rag_service
from app.services.rag_service import RAGService


router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    rag_service: RAGService = Depends(get_rag_service),
):
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty",
        )

    try:
        return await rag_service.answer(
            question=request.question,
            top_k=request.top_k,
            document_ids=request.document_ids,
            generate_answer=request.generate_answer,
            conversation_id=request.conversation_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/query/stream")
async def query_stream(
    request: QueryRequest,
    rag_service: RAGService = Depends(get_rag_service),
):
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty",
        )

    if rag_service.llm_service is None:
        raise HTTPException(
            status_code=400,
            detail="Streaming requires a configured LLM_PROVIDER (e.g., gemini or groq).",
        )

    async def token_stream():
        try:
            async for token in rag_service.stream_answer(
                question=request.question,
                top_k=request.top_k,
                document_ids=request.document_ids,
                conversation_id=request.conversation_id,
            ):
                yield token
        except RuntimeError as exc:
            yield f"\n\n[Generation error: {exc}]"

    try:
        return StreamingResponse(
            token_stream(),
            media_type="text/plain; charset=utf-8",
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
