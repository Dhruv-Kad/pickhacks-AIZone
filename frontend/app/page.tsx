"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import ChatPanel from "./components/ChatPanel";
import CitationPanel from "./components/CitationPanel";
import type { DocumentInfo, Source } from "./components/types";
import { getDocuments } from "./lib/api";

export default function Page() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [viewingPdf, setViewingPdf] = useState<{ docId?: string; page?: number } | null>(null);

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error("getDocuments failed:", e);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return (
    <div className="min-h-screen">
      <TopBar
        documents={documents}
        selectedDocId={selectedDocId}
        setSelectedDocId={setSelectedDocId}
        onDocumentsChange={refreshDocuments}
      />

      {/* Comfortable padding + spacing */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 md:px-6">
  <div
    className={
      sources.length > 0 && !viewingPdf
        ? "grid gap-4 md:grid-cols-[1fr_420px] md:items-start"
        : "flex justify-center"
    }
  >
    {/* PDF Viewer or Chat */}
    {viewingPdf ? (
      <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b bg-gray-100 px-4 py-3">
          <h2 className="text-lg font-semibold">PDF Viewer</h2>
          <button
            onClick={() => setViewingPdf(null)}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            Close
          </button>
        </div>
        <div className="h-[calc(100vh-200px)]">
          <iframe
            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/documents/${viewingPdf.docId}/file${viewingPdf.page ? `#page=${viewingPdf.page}` : ""}`}
            className="h-full w-full border-0"
          />
        </div>
      </section>
    ) : (
      <section
        className={
          sources.length > 0
            ? "rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
            : "w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
        }
      >
        <div className="h-[calc(100vh-140px)]">
          <ChatPanel selectedDocId={selectedDocId} onSources={setSources} />
        </div>
      </section>
    )}

    {/* Citations (only show when sources exist and not viewing PDF) */}
    {sources.length > 0 && !viewingPdf && (
      <aside className="hidden md:block rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="h-[calc(100vh-140px)]  overflow-y-auto p-4">
          <CitationPanel sources={sources} onViewPdf={setViewingPdf} />
        </div>
      </aside>
    )}
  </div>
</main>
    </div>
  );


  
}

