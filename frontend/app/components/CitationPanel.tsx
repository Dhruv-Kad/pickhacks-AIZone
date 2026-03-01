"use client";

import type { Source } from "./types";




export default function CitationPanel({ sources, onViewPdf }: { sources: Source[]; onViewPdf?: (pdf: { docId?: string; page?: number }) => void }) {
  return (
    <aside className="panel-enter h-full bg-background animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Sources</div>
          <div className="text-xs text-gray-500">
            Relevent PDFs
          </div>
        </div>
        <div className="text-xs text-gray-500 font-semibold">
          {sources.length} source{sources.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="space-y-3 overflow-auto p-4">
        {sources.length === 0 ? (
          <div className="rounded-md border p-3 text-sm text-gray-500">
            No sources yet. Ask a question to see relevant passages from your
            documents.
          </div>
        ) : (
          sources.map((s, idx) => (
            <div key={idx} className="rounded-md border border-gray-200 bg-gray-50 text-gray-800 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-bold">
  {(() => {
    const handleClick = () => {
      if (s.docId && onViewPdf) {
        onViewPdf({ docId: s.docId, page: s.page });
      }
    };

    return s.docId ? (
      <button
        onClick={handleClick}
        className="underline underline-offset-4 hover:opacity-80 text-left"
      >
          {(() => {
  const baseName = s.filename.replace(/\.pdf$/i, ""); // remove existing .png if present

  if (baseName.length > 12) {
    return baseName.slice(0, 12) + "....pdf";
  }

  return baseName + ".pdf";
})()}
      </button>
    ) : (
      <span>{s.filename}</span>
    );
  })()}
</div>
                <div className="rounded bg-white flex shrink-0 items-center gap-2">
                  <span className="text-xs text-gray-500">
                  Relevance: {Math.round(s.relevance_score * 100)}%
                  </span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs text-gray-500 leading-relaxed">
                {s.chunk_preview}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
