from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, documents
from services.ingest_service import ingest_folder
from services.vector_store import init_chroma

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_chroma()
    try:
        ingest_folder()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Startup ingestion failed (server will still run): %s", e)
    yield


app = FastAPI(title="AIZone RAG API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/health")
async def health():
    return {"status": "ok"}
