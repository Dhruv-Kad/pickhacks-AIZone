import logging
import os
import uuid
from pathlib import Path

from services.embedding_service import embed_texts
from services.pdf_service import chunk_text, extract_text
from services.vector_store import add_chunks, get_ingested_filenames

logger = logging.getLogger(__name__)

def deletebadfiles(removelist):
    for i in removelist:
        os.remove("../pdfs/" + i.name)

def ingest_folder():
    badguylist = []
    """Scan PDF_INGEST_DIR and ingest any PDFs not already in ChromaDB."""
    ingest_dir = os.environ.get("PDF_INGEST_DIR", "./pdfs")

    folder = Path(ingest_dir)
    if not folder.is_dir():
        logger.warning("PDF_INGEST_DIR '%s' is not a valid directory, skipping.", ingest_dir)
        return

    pdf_files = sorted(folder.glob("*.pdf"))
    if not pdf_files:
        logger.info("No PDF files found in '%s'.", ingest_dir)
        return

    already_ingested = get_ingested_filenames()

    for pdf_path in pdf_files:
        if pdf_path.name in already_ingested:
            logger.info("Skipping '%s' (already ingested).", pdf_path.name)
            badguylist.append(pdf_path)
            continue

        logger.info("Ingesting '%s'...", pdf_path.name)
        file_bytes = pdf_path.read_bytes()

        pages = extract_text(file_bytes, pdf_path.name)
        if not pages:
            logger.warning("Could not extract text from '%s', skipping.", pdf_path.name)
            continue

        chunks = chunk_text(pages)
        texts = [c["text"] for c in chunks]
        embeddings = embed_texts(texts, task_type="RETRIEVAL_DOCUMENT")

        doc_id = str(uuid.uuid4())
        add_chunks(doc_id, pdf_path.name, chunks, embeddings)

        logger.info("Ingested '%s': %d chunks.", pdf_path.name, len(chunks))
        deletebadfiles(badguylist)
