"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearchParams } from 'next/navigation';

export default function ViewerPage() {
  const searchParams = useSearchParams();
  const docId = searchParams.get('docId'); 

  const [documentText, setDocumentText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/documents/${docId}/markdown`)
      .then(res => res.json())
      .then(data => {
        setDocumentText(data.markdown);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching document text:", err);
        setDocumentText("# Error\nCould not load the document text.");
        setLoading(false);
      });
  }, [docId]);

  return (
    <div className="min-h-screen w-full bg-gray-100 p-8 flex justify-center">
      {/* The "Box" where text is printed */}
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg border border-gray-200 p-10">
        
        <h1 className="text-3xl font-bold mb-6 pb-4 border-b text-gray-800">
          Document Text Viewer
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
             <p className="animate-pulse text-lg text-gray-500">Extracting text from document...</p>
          </div>
        ) : (
          <div className="prose prose-lg max-w-none text-gray-700">
            {/* Prints the text inside the box using markdown formatting */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {documentText}
            </ReactMarkdown>
          </div>
        )}

      </div>
    </div>
  );
}