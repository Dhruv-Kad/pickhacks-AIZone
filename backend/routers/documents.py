import uuid
import os
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from models.schemas import DeleteResponse, DocumentListResponse, UploadResponse
from services.embedding_service import embed_texts
from services.pdf_service import chunk_text, extract_text
from services.vector_store import add_chunks, delete_document, get_doc_id_by_filename, list_documents, _doc_metadata

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
    
    # Save PDF to disk
    pdfs_dir = Path(os.environ.get("PDF_STORAGE_DIR", "./pdfs"))
    pdfs_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = pdfs_dir / f"{doc_id}.pdf"
    pdf_path.write_bytes(file_bytes)

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


@router.get("/{doc_id}/file")
async def get_pdf_file(doc_id: str):
    """Serve the PDF file for a given document ID."""
    pdfs_dir = Path(os.environ.get("PDF_STORAGE_DIR", "./pdfs"))

    # Try {doc_id}.pdf first (from upload endpoint)
    pdf_path = pdfs_dir / f"{doc_id}.pdf"

    # Fall back to original filename from the database (from folder ingestion)
    if not pdf_path.exists():
        meta = _doc_metadata.get(doc_id)
        if meta:
            pdf_path = pdfs_dir / meta["filename"]

    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_path.name
    )

# backend/routers/documents.py

@router.get("/{doc_id}/markdown")
async def get_markdown_content(doc_id: str):
    """Serve the generated Markdown text for a given document ID."""
    # Ensure this matches the PDF_INGEST_DIR or storage path
    storage_dir = Path("./pdfs") 
    md_path = storage_dir / f"{doc_id}.md"

    if not md_path.exists():
        raise HTTPException(status_code=404, detail="Markdown file not found")

    content = md_path.read_text(encoding="utf-8")
    return {"id": doc_id, "markdown": content}