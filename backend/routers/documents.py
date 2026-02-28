import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from models.schemas import DeleteResponse, DocumentListResponse, UploadResponse
from services.embedding_service import embed_texts
from services.pdf_service import chunk_text, extract_text
from services.vector_store import add_chunks, delete_document, list_documents

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")

    # Extract text from PDF
    pages = extract_text(file_bytes, file.filename)
    if not pages:
        raise HTTPException(
            status_code=400, detail="Could not extract text from PDF"
        )

    # Chunk the text
    chunks = chunk_text(pages)

    # Embed all chunks
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts, task_type="RETRIEVAL_DOCUMENT")

    # Store in ChromaDB
    doc_id = str(uuid.uuid4())
    add_chunks(doc_id, file.filename, chunks, embeddings)

    return UploadResponse(
        id=doc_id,
        filename=file.filename,
        num_chunks=len(chunks),
        message=f"Successfully processed {file.filename}: {len(chunks)} chunks created",
    )


@router.get("/", response_model=DocumentListResponse)
async def get_documents():
    docs = list_documents()
    return DocumentListResponse(documents=docs)


@router.delete("/{doc_id}", response_model=DeleteResponse)
async def remove_document(doc_id: str):
    delete_document(doc_id)
    return DeleteResponse(message=f"Document {doc_id} deleted")
