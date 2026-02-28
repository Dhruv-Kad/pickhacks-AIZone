"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage, Source } from "./types";
import { sendChat } from "../lib/api";
import { MessageDisplay } from "./MessageDisplay";

const bubbleDelayMs = 1000; // 500–2000

export default function ChatPanel(props: {
  selectedDocId: string | null;
  onSources: (sources: Source[]) => void;
  /** Optional style to apply to the user input box (e.g. {backgroundColor: '#ff0'}) */
  inputStyle?: React.CSSProperties;
  /** Additional Tailwind classes to merge with the default input styling */
  inputClassName?: string;
}) {
  const { selectedDocId, onSources, inputStyle, inputClassName } = props;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about if you are able to build on certain land.\n\n" +
        "Examples:\n" +
        '- "Can I build a fence here?"\n' +
        '- "Summarize the key findings."\n' +
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

  // show user message immediately
  setMessages((prev) => [...prev, { role: "user", content: question }]);

  setLoading(true);

  // unique id for this assistant response
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // schedule the assistant bubble to APPEAR after delay (placeholder)
  const bubbleTimer = setTimeout(() => {
    setMessages((prev) => {
      // if it already exists (edge case), don't add twice
      if (prev.some((m: any) => m._id === id)) return prev;

      return [
        ...prev,
        { role: "assistant", content: "Thinking…", _id: id, _pending: true } as any,
      ];
    });
  }, bubbleDelayMs);

  try {
    const data = await sendChat(question, selectedDocId ?? undefined);

    // ensure placeholder exists (if API returned before delay)
    clearTimeout(bubbleTimer);
    setMessages((prev) => {
      const exists = prev.some((m: any) => m._id === id);
      if (!exists) {
        return [
          ...prev,
          { role: "assistant", content: "…", _id: id, _pending: true } as any,
        ];
      }
      return prev;
    });

    // now fill in the placeholder with the real answer
    setMessages((prev) =>
      prev.map((m: any) =>
        m._id === id
          ? { role: "assistant", content: data.answer, _id: id, _pending: false }
          : m
      )
    );

    onSources(data.sources ?? []);
  } catch {
    clearTimeout(bubbleTimer);

    // ensure placeholder exists, then fill with error
    setMessages((prev) => {
      const exists = prev.some((m: any) => m._id === id);
      const next = exists
        ? prev
        : [
            ...prev,
            { role: "assistant", content: "…", _id: id, _pending: true } as any,
          ];
      return next.map((m: any) =>
        m._id === id
          ? {
              role: "assistant",
              content:
                "Couldn't reach the API. Make sure the FastAPI backend is running on port 8000.",
              _id: id,
              _pending: false,
            }
          : m
      );
    });

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
    // add a shadow so the chat panel stands out
    <section className="flex h-full flex-col rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
      <div className="border-b px-4 py-3">
        <div className="text-sm font-semibold">Constructor Advisor</div>
        <div className="text-xs text-gray-500">
          Ask questions about construction legality in your area
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-auto p-4">
        {messages.map((m, idx) => (
          <MessageDisplay key={idx} message={m} />
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            style={inputStyle}
            className={[
              "h-11 flex-1 rounded-md border bg-background px-3 text-sm outline-none",
              inputClassName ?? "",
            ].join(" ")}
            placeholder="Ex: Can I build a fence at Rolla, Missouri?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={loading}
          />
          <button
            className={[
              "h-11 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50 transition-all",
              canSend ? "hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.8)]" : ""
            ].join(" ")}
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
