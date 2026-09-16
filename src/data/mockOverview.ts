import type { OverviewMetric } from "../types/domain";

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

