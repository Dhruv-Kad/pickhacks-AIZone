import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const permitType = body.permitType ?? "fence";
  const question = body.question ?? "";

  return NextResponse.json({
    answer:
      `✅ St. Louis County request received.\n\n` +
      `Build type: ${permitType}\n` +
      `Question: ${question}\n\n` +
      `Next: connect FastAPI + RAG for real citations.`,
    citations: [
      {
        id: "demo-1",
        title: "Demo citation (placeholder)",
        snippet:
          "This is a placeholder. When RAG is wired, you’ll see real St. Louis County ordinance / permit page citations here.",
      },
    ],
  });
}