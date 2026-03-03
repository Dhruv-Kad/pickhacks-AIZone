import fitz

def extract_text(file_bytes: bytes, filename: str) -> list[dict]:
    """Extract text from a PDF, returning a list of {page, text} dicts."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            pages.append({"page": page_num + 1, "text": text})
    doc.close()
    return pages

def chunk_text(
    pages: list[dict], chunk_size: int = 1000, overlap: int = 200
) -> list[dict]:
    """Split page text into overlapping chunks."""
    chunks = []
    chunk_index = 0
    for page_info in pages:
        text = page_info["text"]
        page = page_info.get("page", 1) 
        
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text_slice = text[start:end]
            if chunk_text_slice.strip():
                chunks.append(
                    {
                        "text": chunk_text_slice,
                        "page": page,
                        "chunk_index": chunk_index,
                    }
                )
                chunk_index += 1
            start += chunk_size - overlap
    return chunks