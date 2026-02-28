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

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch {
      // Backend might not be running yet
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        documents={documents}
        selectedDocId={selectedDocId}
        setSelectedDocId={setSelectedDocId}
        onDocumentsChange={refreshDocuments}
      />

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 md:grid-cols-[1fr_380px]">
        <div className="h-[calc(100vh-57px)]">
          <ChatPanel selectedDocId={selectedDocId} onSources={setSources} />
        </div>

        <div className="hidden h-[calc(100vh-57px)] md:block">
          <CitationPanel sources={sources} />
        </div>
      </main>
    </div>
  );
}
