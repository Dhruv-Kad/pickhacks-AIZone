from pydantic import BaseModel


class ChatRequest(BaseModel):
    query: str
    document_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


class DocumentInfo(BaseModel):
    id: str
    filename: str
    num_chunks: int
    uploaded_at: str


class DocumentListResponse(BaseModel):
    documents: list[DocumentInfo]


class UploadResponse(BaseModel):
    id: str
    filename: str
    num_chunks: int
    message: str


class DeleteResponse(BaseModel):
    message: str
