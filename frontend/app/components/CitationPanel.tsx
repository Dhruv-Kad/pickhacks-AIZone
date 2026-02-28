"use client";

import type { Citation } from "./types";

export default function CitationPanel({ citations }: { citations: Citation[] }) {
  return (
    <aside className="h-full border-l bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Citations</div>
          <div className="text-xs text-muted-foreground">
            Evidence from St. Louis County sources
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {citations.length} item{citations.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {citations.length === 0 ? (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            No citations yet. Ask a question to populate this panel.
          </div>
        ) : (
          citations.map((c) => (
            <div key={c.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium">{c.title}</div>
                {c.url ? (
                  <a
                    className="text-xs underline"
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    open
                  </a>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {c.snippet}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}