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
    "You are a zoning and construction assistant. "
    "First, check if the provided context contains the answer to the user's question. "
    "If it DOES, answer the question and cite the document and page number. "
    "If the context DOES NOT contain the answer, or if the context is empty, "
    "you MUST call the `downloaddoc` tool to search for new documents. "
    "Do NOT reply in text saying 'I cannot answer this' or 'The context does not contain this'. "
    "You must call the tool instead. You must also pull from accurate pdfs "
    "to ensure accurate information on the subject. You must search for PDFs only. "
    "When providing an answer, Do a Green/Yellow/Red System. Green means yes, you can do it with no restrictions, " 
    "yellow means yes you can do it but there are restrictions and show the restrictions, " 
    "and red means no, under no circumstances can you do this and say why. If its a question like 'can I do this', " 
    "you must list each section Green, yellow, and red and say the regulations for each."
)

def downloaddoc(query: str):
    """Search the web for relevant PDF documents and download them."""
    ai_query_web(query, "./pdfs")
    ingest_folder()
    
downloaddoc_declaration = types.FunctionDeclaration(
    name="downloaddoc",
    description="Search the web for relevant PDF documents and download them. You MUST call this tool whenever the provided context does not contain the answer to the user's question.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "query": types.Schema(
                type=types.Type.STRING,
                description="The exact search query to find relevant PDF documents on the web.",
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


def generate_answer(query: str, document_id: str | None = None, search_depth: int = 0) -> dict:
    """Run the full RAG pipeline: embed → retrieve → generate."""
    query_embedding = embed_query(query)
    results = query_chunks(query_embedding, n_results=5, document_id=document_id)

    documents = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

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
                "exact_quote": doc_text[:100], 
                "relevance_score": round(1 - dist, 4),
                "docId": meta["document_id"],
            }
        )
    context = "\n\n---\n\n".join(context_parts)

    client = _get_client()
    
    prompt = f"""Context from documents:

{context}

---

Question: {query}"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=[downloaddoc_tool],
            ),
        )
    except Exception as e:
        print(f"GOOGLE API ERROR: {str(e)}")
        return {
            "answer": f"Google API Error: {str(e)}", 
            "sources": sources
        }

    if response.candidates and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if part.function_call and part.function_call.name == "downloaddoc":
                
                if search_depth >= 5: 
                    final_prompt = prompt + "\n\n[System Note: Web search limit reached. You MUST answer the user's question using ONLY the context provided above. If the exact answer is not available, explain what the documents DO say, or state that the specific regulation wasn't found in the downloaded files. Do not refuse to answer.]"
                    
                    final_response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=final_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction="You are a helpful assistant. Provide the best answer possible based ONLY on the provided context.",
                        )
                    )
                    return {"answer": final_response.text, "sources": sources}

                args = part.function_call.args
                search_query = args.get("query", query) if isinstance(args, dict) else getattr(args, "query", query)
                
                print(f"Gemini requested a web search for: {search_query}")
                downloaddoc(search_query)
                
                return generate_answer(query, document_id, search_depth + 1)

    try:
        return {"answer": response.text, "sources": sources}
    except ValueError:
        return {"answer": "I attempted to find the answer but encountered an error. Please try again.", "sources": sources}