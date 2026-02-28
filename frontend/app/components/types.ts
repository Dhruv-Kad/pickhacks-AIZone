export type Jurisdiction = "stl_county";

export type PermitType = "fence" | "shed" | "treehouse";

export type Citation = {
  id: string;
  title: string;
  snippet: string;
  url?: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AskRequest = {
  jurisdiction: Jurisdiction; // always "stl_county"
  permitType: PermitType;
  question: string;
  state?: Record<string, unknown>;
};

export type AskResponse = {
  answer: string;
  citations: Citation[];
  nextQuestions?: { id: string; label: string; type: "text" | "yesno" }[];
  packetJson?: Record<string, unknown> | null;
};