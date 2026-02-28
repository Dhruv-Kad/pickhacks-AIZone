"use client";

import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type Props = {
  pdfUrl: string;
  initialPage: number;
  filename: string;
  onClose: () => void;
};

export default function PdfViewerModal({
  pdfUrl,
  initialPage,
  filename,
  onClose,
}: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(initialPage || 1);
  const [scale, setScale] = useState(1.2);

  const goToPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);

  const goToNext = useCallback(() => {
    setPageNumber((p) => Math.min(numPages, p + 1));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(3, +(s + 0.2).toFixed(1)));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(0.4, +(s - 0.2).toFixed(1)));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goToPrev, goToNext, zoomIn, zoomOut]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-[90vh] w-[90vw] max-w-5xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <span className="truncate text-sm font-semibold">{filename}</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-4 border-b border-[var(--border)] px-4 py-2 text-sm">
          {/* Page nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              disabled={pageNumber <= 1}
              className="rounded-md px-2 py-1 hover:bg-[var(--border)] disabled:opacity-30 transition-colors"
            >
              &#8592; Prev
            </button>
            <span className="tabular-nums">
              {pageNumber} / {numPages || "?"}
            </span>
            <button
              onClick={goToNext}
              disabled={pageNumber >= numPages}
              className="rounded-md px-2 py-1 hover:bg-[var(--border)] disabled:opacity-30 transition-colors"
            >
              Next &#8594;
            </button>
          </div>

          <div className="h-5 w-px bg-[var(--border)]" />

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="rounded-md px-2 py-1 hover:bg-[var(--border)] transition-colors"
            >
              &minus;
            </button>
            <span className="w-14 text-center tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="rounded-md px-2 py-1 hover:bg-[var(--border)] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              loading={
                <div className="flex h-64 items-center justify-center text-sm text-[var(--muted-foreground)]">
                  Loading PDF…
                </div>
              }
              error={
                <div className="flex h-64 items-center justify-center text-sm text-red-500">
                  Failed to load PDF.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="flex h-64 items-center justify-center text-sm text-[var(--muted-foreground)]">
                    Rendering page…
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}
