import type { RecentQuery } from "../types/domain";

export const mockDefaultQuestion =
  "What is the approval process for a request?";

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
