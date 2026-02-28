"use client";

import { useMemo, useRef, useState } from "react";
import type { AskResponse, ChatMessage, Citation, PermitType } from "./types";

export default function ChatPanel(props: {
  permitType: PermitType;
  onCitations: (citations: Citation[]) => void;
}) {
  const { permitType, onCitations } = props;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask a St. Louis County question like:\n" +
        "• “Can I build a 6ft fence?”\n" +
        "• “Do I need a permit for a shed?”\n" +
        "• “Can I build a treehouse in my backyard?”\n\n" +
        "I’ll answer with citations once the RAG backend is wired.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function send() {
    if (!canSend) return;

    const question = input.trim();
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: question }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jurisdiction: "stl_county",
          permitType,
          question,
          state: {},
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = (await res.json()) as AskResponse;

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      onCitations(data.citations ?? []);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Couldn’t reach the API. If you haven’t created /api/ask yet, add a stub route.\n\n(Once FastAPI is connected, this will work.)",
        },
      ]);
      onCitations([]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <section className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-semibold">Assistant</div>
        <div className="text-xs text-muted-foreground">
          Jurisdiction: <span className="font-medium">St. Louis County</span> · Build type:{" "}
          <span className="font-medium">{permitType}</span>
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
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            className="h-11 flex-1 rounded-md border bg-background px-3 text-sm outline-none"
            placeholder="Ask a permit question…"
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
            {loading ? "Sending…" : "Send"}
          </button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Right now this hits <code>/api/ask</code> (stub). Later you’ll connect it to FastAPI + RAG.
        </div>
      </div>
    </section>
  );
}