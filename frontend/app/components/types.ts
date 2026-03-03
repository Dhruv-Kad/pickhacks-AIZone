export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  _pending?: boolean;
};

export type Source = {
  filename: string;
  page: number;
  relevance_score: number;
  chunk_preview: string;
  exact_quote?: string;

  docId?: string;
  pdfUrl?: string;
};

export type DocumentInfo = {
  id: string;
  filename: string;
  num_chunks: number;
  uploaded_at: string;
};

export type ChatRequest = {
  query: string;
  document_id?: string;
};

export type ChatResponse = {
  answer: string;
  sources: Source[];
};

export type UploadResponse = {
  id: string;
  filename: string;
  num_chunks: number;
  message: string;
};