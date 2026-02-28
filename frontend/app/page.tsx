"use client";

import { useState } from "react";
import TopBar from "./components/TopBar";
import ChatPanel from "./components/ChatPanel";
import CitationPanel from "./components/CitationPanel";
import type { Citation, PermitType } from "./components/types";

export default function Page() {
  const [permitType, setPermitType] = useState<PermitType>("fence");
  const [citations, setCitations] = useState<Citation[]>([]);

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar permitType={permitType} setPermitType={setPermitType} />

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 md:grid-cols-[1fr_380px]">
        <div className="h-[calc(100vh-57px)]">
          <ChatPanel permitType={permitType} onCitations={setCitations} />
        </div>

        <div className="hidden h-[calc(100vh-57px)] md:block">
          <CitationPanel citations={citations} />
        </div>
      </main>
    </div>
  );
}