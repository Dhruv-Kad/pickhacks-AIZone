import logging
import os
import uuid
from pathlib import Path
import pymupdf4llm

from services.embedding_service import embed_texts
from services.pdf_service import chunk_text
from services.vector_store import add_chunks, get_ingested_filenames

logger = logging.getLogger(__name__)

def ingest_folder():
    """Scan PDF_INGEST_DIR, convert to Markdown, and ingest into ChromaDB."""
    ingest_dir = os.environ.get("PDF_INGEST_DIR", "./pdfs")
    folder = Path(ingest_dir)
    
    if not folder.is_dir():
        folder.mkdir(parents=True, exist_ok=True)

    pdf_files = sorted(folder.glob("*.pdf"))
    already_ingested = get_ingested_filenames()

    for pdf_path in pdf_files:
        if pdf_path.name in already_ingested:
            continue

        logger.info("Ingesting '%s'...", pdf_path.name)
        
        try:
            doc_id = str(uuid.uuid4())
            md_text = pymupdf4llm.to_markdown(str(pdf_path))
            
            md_path = folder / f"{doc_id}.md"
            md_path.write_text(md_text, encoding="utf-8")

            pages = [{"text": md_text}] 
            chunks = chunk_text(pages)
            texts = [c["text"] for c in chunks]
            embeddings = embed_texts(texts, task_type="RETRIEVAL_DOCUMENT")

            add_chunks(doc_id, pdf_path.name, chunks, embeddings)
            logger.info("Successfully ingested '%s'", pdf_path.name)
            
        except Exception as e:
            logger.error("Failed to process '%s': %s", pdf_path.name, e)