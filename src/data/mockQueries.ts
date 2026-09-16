import type { RagAnswer, RecentQuery, SourceReference } from "../types/domain";

export const mockDefaultQuestion =
  "What is the approval process for a request?";

export const mockAnswer: RagAnswer = {
  text: "The request must first be reviewed by the responsible area and then approved by the designated approver.",
  model: "llama3.2:3b",
  latencyMs: 412,
};

export const mockSources: SourceReference[] = [
  {
    id: "src-01",
    document: "Approval Process.pdf",
    page: 14,
    similarity: 0.94,
    snippet:
      "The responsible area must review each request before it is forwarded to the designated approver for final sign-off.",
  },
  {
    id: "src-02",
    document: "Company Procedures.pdf",
    page: 8,
    similarity: 0.89,
    snippet:
      "Requests require approval from a designated approver before they can be executed or scheduled.",
  },
];

export const mockRecentQueries: RecentQuery[] = [
  {
    id: "q-01",
    question: "What is the approval process?",
    score: 0.94,
    chunks: 5,
    responseTimeMs: 412,
    ranAgo: "2 min ago",
  },
  {
    id: "q-02",
    question: "How long should a request take?",
    score: 0.89,
    chunks: 3,
    responseTimeMs: 365,
    ranAgo: "18 min ago",
  },
  {
    id: "q-03",
    question: "Who can approve a request?",
    score: 0.91,
    chunks: 4,
    responseTimeMs: 402,
    ranAgo: "1 hr ago",
  },
  {
    id: "q-04",
    question: "What happens after approval?",
    score: 0.83,
    chunks: 5,
    responseTimeMs: 388,
    ranAgo: "3 hr ago",
  },
];
