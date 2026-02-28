export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Source = {
  filename: string;
  page: number;
  chunk_preview: string;
  relevance_score: number;
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
