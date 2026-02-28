"use client";

import { useRef, useState } from "react";
import type { DocumentInfo } from "./types";
import { uploadPdf, deleteDocument } from "../lib/api";

export default function TopBar(props: {
  documents: DocumentInfo[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onDocumentsChange: () => void;
}) {
  const { documents, selectedDocId, setSelectedDocId, onDocumentsChange } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadPdf(file);
      onDocumentsChange();
    } catch (err) {
      alert("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Delete this document?")) return;
    await deleteDocument(docId);
    if (selectedDocId === docId) setSelectedDocId(null);
    onDocumentsChange();
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white text-xs font-bold">
            AI
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">AIZone</div>
            <div className="text-xs text-muted-foreground">
              PDF Knowledge Assistant
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Query</span>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={selectedDocId ?? "all"}
              onChange={(e) =>
                setSelectedDocId(e.target.value === "all" ? null : e.target.value)
              }
            >
              <option value="all">All documents</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({d.num_chunks} chunks)
                </option>
              ))}
            </select>
          </div>

          {documents.length > 0 && selectedDocId && (
            <button
              className="h-9 rounded-md border px-3 text-xs text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(selectedDocId)}
            >
              Delete
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            className="h-9 rounded-md bg-black px-4 text-sm font-semibold text-white disabled:opacity-50"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
      </div>
    </header>
  );
}
