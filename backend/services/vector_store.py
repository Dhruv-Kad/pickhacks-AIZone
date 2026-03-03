import os
from datetime import datetime, timezone

import chromadb

_client = None
_collection = None
_doc_metadata: dict[str, dict] = {}

COLLECTION_NAME = "pdf_documents"


def init_chroma():
    """Initialize ChromaDB client and collection on startup."""
    global _client, _collection
    persist_dir = os.environ.get("CHROMA_PERSIST_DIR", "./chroma_data")
    _client = chromadb.PersistentClient(path=persist_dir)
    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    rebuild_doc_metadata()

def rebuild_doc_metadata():
    """Reconstruct document metadata from ChromaDB on startup."""
    all_data = _collection.get(include=["metadatas"])
    seen: dict[str, dict] = {}
    for meta in all_data["metadatas"] or []:
        doc_id = meta["document_id"]
        if doc_id not in seen:
            seen[doc_id] = {
                "filename": meta["filename"],
                "num_chunks": 0,
                "uploaded_at": meta.get("uploaded_at", "unknown"),
            }
        seen[doc_id]["num_chunks"] += 1
    _doc_metadata.update(seen)

def add_chunks(doc_id, filename, chunks, embeddings):
    uploaded_at = datetime.now(timezone.utc).isoformat()
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    documents = [c["text"] for c in chunks]
    metadatas = [
        {
            "document_id": doc_id,
            "filename": filename,
            "page": c.get("page", 1),
            "chunk_index": c["chunk_index"],
            "uploaded_at": uploaded_at,
        }
        for c in chunks
    ]
    _collection.add(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)
    _doc_metadata[doc_id] = {
        "filename": filename,
        "num_chunks": len(chunks),
        "uploaded_at": uploaded_at,
    }

def query_chunks(
    query_embedding: list[float],
    n_results: int = 5,
    document_id: str | None = None,
) -> dict:
    """Query ChromaDB for similar chunks, optionally filtered by document."""
    where_filter = {"document_id": document_id} if document_id else None
    return _collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )


def delete_document(doc_id: str):
    """Delete all chunks belonging to a document."""
    _collection.delete(where={"document_id": doc_id})
    _doc_metadata.pop(doc_id, None)


def list_documents() -> list[dict]:
    """List all uploaded documents."""
    return [{"id": doc_id, **meta} for doc_id, meta in _doc_metadata.items()]


def get_ingested_filenames() -> set[str]:
    """Return the set of filenames already stored in ChromaDB."""
    return {meta["filename"] for meta in _doc_metadata.values()}


def get_doc_id_by_filename(filename: str) -> str | None:
    """Return the document ID for a given filename, or None if not found."""
    for doc_id, meta in _doc_metadata.items():
        if meta["filename"] == filename:
            return doc_id
    return None