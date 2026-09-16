import type { LearnSection } from "../types/domain";

export const mockLearnSections: LearnSection[] = [
  {
    id: "documents",
    step: "01",
    title: "Documents",
    text: "Your knowledge starts with documents. PDFs, markdown files and notes are indexed locally — nothing leaves your machine.",
    visual: {
      kind: "documents",
      items: [
        "Employee Handbook.pdf",
        "Approval Process.pdf",
        "Docker Guide.pdf",
        "+ 9 more documents",
      ],
    },
  },
  {
    id: "chunking",
    step: "02",
    title: "Chunking",
    text: "Documents are divided into smaller pieces. Chunks are big enough to hold meaning and small enough to retrieve precisely.",
    visual: { kind: "chunks", size: 512, overlap: 15, total: 1482 },
  },
  {
    id: "embeddings",
    step: "03",
    title: "Embeddings",
    text: "Text is converted into vectors — lists of numbers where similar meanings land close together, even without shared keywords.",
    visual: {
      kind: "embeddings",
      samples: [
        {
          text: "The responsible area must review each request…",
          vector: [0.031, -0.087, 0.122, -0.004, 0.076, -0.019],
        },
        {
          text: "Requests are checked before final sign-off…",
          vector: [0.029, -0.081, 0.118, -0.002, 0.071, -0.022],
        },
      ],
    },
  },
  {
    id: "vector-search",
    step: "04",
    title: "Vector Search",
    text: "Your question becomes a vector too. The system finds the stored chunks that are semantically closest to it.",
    visual: {
      kind: "vector-search",
      query: "approval process",
      points: [
        { label: "Approval Process.pdf · p.14", distance: 0.94 },
        { label: "Company Procedures.pdf · p.8", distance: 0.89 },
        { label: "Employee Handbook.pdf · p.21", distance: 0.83 },
        { label: "Security Policy.pdf · p.9", distance: 0.71 },
        { label: "Docker Guide.pdf · p.44", distance: 0.31 },
      ],
    },
  },
  {
    id: "context",
    step: "05",
    title: "Context",
    text: "Relevant chunks are provided to the LLM. This is the moment RAG changes the answer — the model is grounded in your documents.",
    visual: {
      kind: "context",
      window: 8192,
      chunks: [
        "Approval Process.pdf · p.14 · 512 tokens",
        "Company Procedures.pdf · p.8 · 512 tokens",
        "Employee Handbook.pdf · p.21 · 512 tokens",
      ],
    },
  },
  {
    id: "generation",
    step: "06",
    title: "Generation",
    text: "The LLM generates an answer using that context — locally, and with citations back to the chunks it actually used.",
    visual: {
      kind: "generation",
      answer:
        "The request must first be reviewed by the responsible area and then approved by the designated approver.",
    },
  },
];
