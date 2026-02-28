"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage, Source } from "./types";
import { sendChat } from "../lib/api";

export default function ChatPanel(props: {
  selectedDocId: string | null;
  onSources: (sources: Source[]) => void;
}) {
  const { selectedDocId, onSources } = props;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Upload a PDF and ask me anything about it.\n\n" +
        "Examples:\n" +
        '- "What is this document about?"\n' +
        '- "Summarize the key findings"\n' +
        '- "What does section 3 say about...?"',
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  async function send() {
    if (!canSend) return;

    const question = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: question }]);

    try {
      const data = await sendChat(question, selectedDocId ?? undefined);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
      onSources(data.sources ?? []);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Couldn't reach the API. Make sure the FastAPI backend is running on port 8000.",
        },
      ]);
      onSources([]);
    } finally {
      setLoading(false);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    }
  }

  return (
    <section className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-semibold">Chat</div>
        <div className="text-xs text-muted-foreground">
          Ask questions about your uploaded PDFs
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={[
              "max-w-[85%] whitespace-pre-wrap rounded-lg border px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-black text-white"
                : "mr-auto bg-background",
            ].join(" ")}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="mr-auto max-w-[85%] rounded-lg border px-3 py-2 text-sm text-muted-foreground animate-pulse">
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            className="h-11 flex-1 rounded-md border bg-background px-3 text-sm outline-none"
            placeholder="Ask a question about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={loading}
          />
          <button
            className="h-11 rounded-md bg-black px-4 text-sm font-semibold text-white disabled:opacity-50"
            onClick={send}
            disabled={!canSend}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
