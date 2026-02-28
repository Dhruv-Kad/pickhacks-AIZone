"use client";

import type { Source } from "./types";




export default function CitationPanel({ sources }: { sources: Source[] }) {
  return (
    <aside className="panel-enter h-full bg-background animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Sources</div>
          <div className="text-xs text-muted-foreground">
            Retrieved from your PDFs
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {sources.length} source{sources.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="space-y-3 overflow-auto p-4">
        {sources.length === 0 ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            No sources yet. Ask a question to see relevant passages from your
            documents.
          </div>
        ) : (
          sources.map((s, idx) => (
            <div key={idx} className="rounded-md border border-zinc-200 bg-blue-300 text-black p-3 font-semibold">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium">
  {(() => {
    const href =
      s.pdfUrl
        ? (s.page ? `${s.pdfUrl}#page=${s.page}` : s.pdfUrl)
        : s.docId
          ? `/viewer?docId=${encodeURIComponent(s.docId)}&page=${s.page}`
          : null;

    return href ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 hover:opacity-80"
      >
        {s.filename}
      </a>
    ) : (
      <span>{s.filename}</span>
    );
  })()}
</div>
                <div className="rounded bg-white flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Relevance = {Math.round(s.relevance_score * 100)}%
                  </span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
                {s.chunk_preview}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
