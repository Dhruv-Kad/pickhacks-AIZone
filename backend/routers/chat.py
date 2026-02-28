from fastapi import APIRouter

from models.schemas import ChatRequest, ChatResponse
from services.rag_service import generate_answer

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = generate_answer(query=request.query, document_id=request.document_id)
    return ChatResponse(answer=result["answer"], sources=result["sources"])
