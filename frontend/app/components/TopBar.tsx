"use client";

import { useRef, useState } from "react";
import type { DocumentInfo } from "./types";
import { uploadPdf, deleteDocument } from "../lib/api";

type TopBarProps = {
  documents: DocumentInfo[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onDocumentsChange: () => void;
};

export default function TopBar({
  documents,
  selectedDocId,
  setSelectedDocId,
  onDocumentsChange,
}: TopBarProps) {
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
      alert(
        "Upload failed: " + (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setUploading(false);
      // clear input so you can re-upload the same file
      e.target.value = "";
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Delete this document?")) return;

    await deleteDocument(docId);
    if (selectedDocId === docId) setSelectedDocId(null);
    onDocumentsChange();
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-slate-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white text-xs font-bold">
            AI
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold"></div>
            <div className="text-xs text-muted-foreground">
              DSKT 18 - PickHax Hackathon 2026
            </div>
          </div>
        </div>


      </div>
    </header>
  );
}