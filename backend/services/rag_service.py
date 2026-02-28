import os
from services.ingest_service import ingest_folder
from services.scraper_service import ai_query_web

from google import genai
from google.genai import types

from services.embedding_service import embed_query
from services.vector_store import query_chunks
import services.ingest_service as impser

_client = None

SYSTEM_PROMPT = (
    "You are a helpful assistant that answers questions based on the provided "
    "context from PDF documents. Use ONLY the provided context to answer the "
    "question. If the context doesn't contain enough information to answer, "
    "call the downloaddoc tool with the query to search for and download relevant PDFs. "
    "Always cite which document and page the information came from."
)

def downloaddoc(query: str):
    """Search the web for relevant PDF documents and download them."""
    ai_query_web(query, "./pdfs")
    ingest_folder()

    

downloaddoc_declaration = types.FunctionDeclaration(
    name="downloaddoc",
    description="Search the web for relevant PDF documents and download them. Call this when the provided context doesn't contain enough information to answer the user's question. However, use this only as a last resort.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "query": types.Schema(
                type=types.Type.STRING,
                description="The search query to find relevant PDF documents on the web.",
            ),
        },
        required=["query"],
    ),
)

downloaddoc_tool = types.Tool(function_declarations=[downloaddoc_declaration])


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
        ingest_folder()

        return {
            "answer": "No relevant information found in the uploaded documents.",
            "sources": [],
        }

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
        model="gemini-3.1-pro-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=[downloaddoc_tool],
        ),
    )

    # Check if Gemini wants to call the downloaddoc tool
    if response.candidates and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if part.function_call and part.function_call.name == "downloaddoc":
                args = part.function_call.args
                search_query = args.get("query", query)
                downloaddoc(search_query)
                # Re-run RAG pipeline with newly ingested documents
                return generate_answer(query, document_id)

    return {"answer": response.text, "sources": sources}
