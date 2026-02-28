import { useTypewriter } from "./useTypewriter";
import type { ChatMessage } from "./types";

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
      {displayedText}
    </div>
  );
}
