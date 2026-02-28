import { useTypewriter } from "./useTypewriter";
import type { ChatMessage } from "./types";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MessageDisplay({ message }: { message: ChatMessage }) {
  // Animate assistant messages that are no longer pending
  const shouldAnimate = message.role === "assistant" && !(message as any)._pending;
  const displayedText = useTypewriter(message.content, shouldAnimate);

  return (
    <div
      className={[
        "chat-msg-enter max-w-[85%] whitespace-pre-wrap rounded-lg border px-3 py-2 text-sm",
        message.role === "user"
          ? "ml-auto border-blue-400 bg-blue-500 text-white"
          : "mr-auto border-gray-300 bg-gray-300 text-gray-800",
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
        <code className="rounded bg-black/10 px-1 py-0.5 text-sm">
          {children}
        </code>
      ) : (
        <pre className="rounded bg-black text-white p-3 overflow-x-auto text-sm">
          <code className={className}>{children}</code>
        </pre>
      );
    },
  }}
>
  {displayedText}
</ReactMarkdown>
    </div>
  );
}
