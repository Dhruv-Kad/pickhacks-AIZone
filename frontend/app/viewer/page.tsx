"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function YourExistingViewerPage({ params, searchParams }: any) {
  const docId = searchParams?.docId || params?.id; 

  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;

    fetch(`http://localhost:8000/api/documents/${docId}/markdown`)
      .then(res => res.json())
      .then(data => {
        setMarkdown(data.markdown);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching markdown:", err));
  }, [docId]);

  return (
    <div className="flex h-screen w-full">
      {/* 2. Swap the iframe/PDF viewer for ReactMarkdown */}
      <div className="w-full h-full overflow-y-auto p-8 bg-white text-gray-800">
        {loading ? (
          <div className="animate-pulse">Loading clean document...</div>
        ) : (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>        )}
      </div>
    </div>
  );
}