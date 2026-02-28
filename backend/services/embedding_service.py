import os

from google import genai
from google.genai import types

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


def embed_texts(
    texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT"
) -> list[list[float]]:
    """Embed a list of texts using Gemini embedding model."""
    client = _get_client()
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=768,
        ),
    )
    return [e.values for e in result.embeddings]


def embed_query(query: str) -> list[float]:
    """Embed a single query string with RETRIEVAL_QUERY task type."""
    result = embed_texts([query], task_type="RETRIEVAL_QUERY")
    return result[0]
