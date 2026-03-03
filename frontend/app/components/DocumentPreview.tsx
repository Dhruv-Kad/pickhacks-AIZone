import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocumentPreview({ 
  markdownContent, 
  exactQuote 
}: { 
  markdownContent: string; 
  exactQuote?: string; 
}) {
  const [isFound, setIsFound] = useState(false);

  useEffect(() => {
    if (!exactQuote || !markdownContent || isFound) return;

    const cleanQuote = exactQuote
      .replace(/[*#_`>\[\]]/g, '') 
      .replace(/\n/g, ' ')         
      .trim()
      .substring(0, 40);           

    if (!cleanQuote) return;

    let attempts = 0;
    const searchInterval = setInterval(() => {
      attempts++;
      
      window.getSelection()?.removeAllRanges();
      
      const found = (window as any).find(cleanQuote, false, false, true);
      
      if (found) {
        setIsFound(true);
        clearInterval(searchInterval); 
      } else if (attempts > 15) {
        clearInterval(searchInterval);
      }
    }, 200);

    return () => clearInterval(searchInterval);
  }, [exactQuote, markdownContent, isFound]);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 relative my-8">
      <button 
        onClick={() => window.close()} 
        className="absolute top-6 right-8 bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 z-10"
      >
        Close
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 pr-24">
        Document Source
      </h2>
      
      <div className="text-gray-700 leading-relaxed space-y-4 prose max-w-none break-words relative">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
            h2: ({...props}) => <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
            h3: ({...props}) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
            ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
            table: ({...props}) => <div className="overflow-x-auto"><table className="min-w-full border-collapse border border-gray-300 mb-4" {...props} /></div>,
            th: ({...props}) => <th className="border border-gray-300 bg-gray-100 px-4 py-2" {...props} />,
            td: ({...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
            pre: ({...props}) => <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4" {...props} />,
            code: ({...props}) => <code className="bg-gray-100 rounded px-1 py-0.5 break-words" {...props} />,
            a: ({...props}) => <a className="text-blue-600 hover:underline break-all" {...props} />,
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}