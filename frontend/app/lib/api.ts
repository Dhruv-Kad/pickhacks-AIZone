import type { ChatResponse, DocumentInfo, UploadResponse } from "../components/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

export async function getDocuments(): Promise<DocumentInfo[]> {
  const res = await fetch(`${API_BASE}/api/documents/`);
  const data = await res.json();
  return data.documents;
}

export async function deleteDocument(docId: string): Promise<void> {
  await fetch(`${API_BASE}/api/documents/${docId}`, { method: "DELETE" });
}

export async function sendChat(
  query: string,
  documentId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, document_id: documentId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}
