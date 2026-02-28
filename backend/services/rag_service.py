import os
from scraper_service import ai_query_web
from google import genai

from services.embedding_service import embed_query
from services.vector_store import query_chunks

_client = None

SYSTEM_PROMPT = (
    "You are a helpful assistant that answers questions based on the provided "
    "context from PDF documents. Use ONLY the provided context to answer the "
    "question. If the context doesn't contain enough information to answer, "
    "say so clearly. Always cite which document and page the information came from."
)


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


def generate_answer(query: str, document_id: str | None = None) -> dict:
    """Run the full RAG pipeline: embed → retrieve → generate."""
    # 1. Embed the query
    query_embedding = embed_query(query)

    # 2. Retrieve relevant chunks
    results = query_chunks(query_embedding, n_results=5, document_id=document_id)

    documents = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    if not documents:
        ai_query_web(query,"../pdfs")
        generate_answer(query,document_id)

       # return {
       #     "answer": "No relevant information found in the uploaded documents.",
       #     "sources": [],
       # }

    # 3. Build context string from retrieved chunks
    context_parts = []
    sources = []
    for i, (doc_text, meta, dist) in enumerate(
        zip(documents, metadatas, distances)
    ):
        context_parts.append(
            f"[Source {i + 1} - {meta['filename']}, Page {meta['page']}]\n{doc_text}"
        )
        sources.append(
            {
                "filename": meta["filename"],
                "page": meta["page"],
                "chunk_preview": (
                    doc_text[:200] + "..." if len(doc_text) > 200 else doc_text
                ),
                "relevance_score": round(1 - dist, 4),
                "docId": meta["document_id"],
            }
        )

    context = "\n\n---\n\n".join(context_parts)

    # 4. Generate answer with Gemini
    client = _get_client()
    prompt = f"""Context from documents:

{context}

---

Question: {query}

Answer based on the context above:"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={"system_instruction": SYSTEM_PROMPT},
    )

    return {"answer": response.text, "sources": sources}
