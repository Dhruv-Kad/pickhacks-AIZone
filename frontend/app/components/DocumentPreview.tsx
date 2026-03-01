import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocumentPreview({ markdownContent }: { markdownContent: string }) {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Zoning Document Preview
      </h2>
      
      {/* The ReactMarkdown component automatically parses the ## headers, 
        bullet points, and tables into standard HTML tags.
      */}
      <div className="text-gray-700 leading-relaxed space-y-4">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-4" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
            table: ({node, ...props}) => <table className="min-w-full border-collapse border border-gray-300 mb-4" {...props} />,
            th: ({node, ...props}) => <th className="border border-gray-300 bg-gray-100 px-4 py-2" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
