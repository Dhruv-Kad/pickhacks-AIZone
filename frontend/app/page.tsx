"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TopBar from "./components/TopBar";
import ChatPanel from "./components/ChatPanel";
import CitationPanel from "./components/CitationPanel";
import type { DocumentInfo, PdfViewerState, Source } from "./components/types";
import { getDocuments } from "./lib/api";

const PdfViewerModal = dynamic(
  () => import("./components/PdfViewerModal"),
  { ssr: false },
);

export default function Page() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [pdfViewer, setPdfViewer] = useState<PdfViewerState>({
    isOpen: false,
    pdfUrl: "",
    initialPage: 1,
    filename: "",
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const openPdfViewer = useCallback(
    (source: Source) => {
      const url = source.pdfUrl
        ? source.pdfUrl
        : source.docId
          ? `${apiBase}/api/documents/${source.docId}/file`
          : null;
      if (!url) return;
      setPdfViewer({
        isOpen: true,
        pdfUrl: url,
        initialPage: source.page || 1,
        filename: source.filename,
      });
    },
    [apiBase],
  );

  const closePdfViewer = useCallback(() => {
    setPdfViewer((prev) => ({ ...prev, isOpen: false }));
  }, []);

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
      sources.length > 0
        ? "grid gap-4 md:grid-cols-[1fr_420px] md:items-start"
        : "flex justify-center"
    }
  >
    {/* Chat */}
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

    {/* Citations (only show when sources exist) */}
    {sources.length > 0 && (
      <aside className="hidden md:block rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="h-[calc(100vh-140px)]  overflow-y-auto p-4">
          <CitationPanel sources={sources} onOpenPdf={openPdfViewer} />
        </div>
      </aside>
    )}
  </div>
</main>
      {pdfViewer.isOpen && (
        <PdfViewerModal
          pdfUrl={pdfViewer.pdfUrl}
          initialPage={pdfViewer.initialPage}
          filename={pdfViewer.filename}
          onClose={closePdfViewer}
        />
      )}
    </div>
  );
}

