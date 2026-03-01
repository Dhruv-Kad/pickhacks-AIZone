"use client";

import { useState, useEffect } from 'react';
import DocumentPreview from './DocumentPreview';

export default function DocumentPage({ docId }: { docId: string }) {
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkdown() {
      try {
        const response = await fetch(`http://localhost:8000/api/documents/${docId}/markdown`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        
        const data = await response.json();
        setMarkdown(data.markdown); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (docId) {
      fetchMarkdown();
    }
  }, [docId]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading zoning document...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-8">
      {/* Feed the fetched string right into the viewer */}
      <DocumentPreview markdownContent={markdown} />
    </div>
  );
}"use client";

import { useState, useEffect } from 'react';
import DocumentPreview from './DocumentPreview';

export default function DocumentPage({ docId }: { docId: string }) {
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkdown() {
      try {
        const response = await fetch(`http://localhost:8000/api/documents/${docId}/markdown`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }
        
        const data = await response.json();
        // data.markdown holds the clean string from pymupdf4llm
        setMarkdown(data.markdown); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (docId) {
      fetchMarkdown();
    }
  }, [docId]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading zoning document...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-8">
      {/* Feed the fetched string right into the viewer */}
      <DocumentPreview markdownContent={markdown} />
    </div>
  );
}
