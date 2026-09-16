import type { OverviewMetric, RecentQuery } from "../types/domain";

export const mockOverviewMetrics: OverviewMetric[] = [
  {
    id: "documents",
    label: "Documents",
    value: "12",
    hint: "+2 this week",
  },
  {
    id: "chunks",
    label: "Chunks",
    value: "1,482",
    hint: "512 tokens · 15% overlap",
  },
  {
    id: "vectors",
    label: "Vectors",
    value: "1,482",
    hint: "BGE-M3 · 1,024 dim",
  },
  {
    id: "queries",
    label: "Queries",
    value: "128",
    hint: "38 today",
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
