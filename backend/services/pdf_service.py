from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(pages: list[dict], chunk_size: int = 800, chunk_overlap: int = 150) -> list[dict]:
    """
    Takes the Markdown string and chunks it for the embedding model,
    prioritizing Markdown headers and paragraphs to keep context intact.
    """
    md_text = pages[0]["text"]
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n# ", "\n## ", "\n### ", "\n\n", "\n", ". ", " "]
    )
    
    split_texts = text_splitter.split_text(md_text)
    
    formatted_chunks = []
    for i, text in enumerate(split_texts):
        formatted_chunks.append({
            "chunk_index": i,
            "text": text
        })
        
    return formatted_chunks