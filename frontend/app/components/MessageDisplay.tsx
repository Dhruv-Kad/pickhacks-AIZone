import { useTypewriter } from "./useTypewriter";
import type { ChatMessage } from "./types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MessageDisplay({ message }: { message: ChatMessage }) {
  const shouldAnimate = message.role === "assistant" && !(message as any)._pending;
  const displayedText = useTypewriter(message.content, shouldAnimate);

  return (
    <div className="flex flex-col gap-1 mb-4">
      <div
        className={[
          "chat-msg-enter max-w-[85%] whitespace-pre-wrap rounded-lg border px-3 py-2 text-sm",
          message.role === "user"
            ? "ml-auto border-blue-500 bg-blue-600 text-white"
            : "mr-auto border-gray-200 bg-gray-100 text-gray-800",
        ].join(" ")}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
            code: ({ children, className }) => {
              const isInline = !className?.includes('language-');
              return isInline ? (
                <code className="rounded bg-gray-200 px-1 py-0.5 text-sm">
                  {children}
                </code>
              ) : (
                <pre className="rounded bg-gray-900 text-gray-100 p-3 overflow-x-auto text-sm">
                  <code className={className}>{children}</code>
                </pre>
              );
            },
          }}
        >
          {displayedText}
        </ReactMarkdown>
      </div>

      {/* NEW: Render clickable source pills with the quote attached to the URL! */}
      {message.sources && message.sources.length > 0 && message.role === "assistant" && (
        <div className="flex flex-wrap gap-2 mt-1 mr-auto max-w-[85%] pl-1">
          {message.sources.map((source: any, index: number) => (
            <a
              key={index}
              href={`/documents/${source.docId}?quote=${encodeURIComponent(source.exact_quote || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full hover:bg-blue-200 hover:shadow-sm transition-all border border-blue-200 font-medium"
            >
              [{index + 1}] {source.filename} (Pg. {source.page})
            </a>
          ))}
        </div>
      )}
    </div>
  );
}