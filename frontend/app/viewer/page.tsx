"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ViewerContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const page = searchParams.get("page");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="border-b bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">PDF Viewer</h1>
            <button
              onClick={() => window.close()}
              className="rounded bg-gray-300 px-3 py-1 text-sm hover:bg-gray-400"
            >
              Close
            </button>
          </div>
          {page && (
            <p className="mt-2 text-sm text-gray-600">
              Page: <span className="font-semibold">{page}</span>
            </p>
          )}
        </div>

        {/* PDF Viewer */}
        <div className="p-4">
          {error ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
              <p className="font-semibold">Error loading PDF</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : !docId ? (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
              No document ID provided
            </div>
          ) : (
            <>
              <div className="rounded-lg border bg-white shadow-sm">
                <iframe
                  src={`${apiBase}/api/documents/${docId}/file${page ? `#page=${page}` : ""}`}
                  className="h-screen w-full rounded-lg border-0"
                  onLoad={() => setLoading(false)}
                  onError={() => setError("Failed to load PDF")}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PDFViewer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewerContent />
    </Suspense>
  );
}
