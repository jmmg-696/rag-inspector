import type { PipelineStage } from "../types/domain";

export const mockPipelineStages: PipelineStage[] = [
  {
    id: "documents",
    label: "Documents",
    icon: "documents",
    description:
      "Your knowledge starts as real files — PDFs, markdown docs, notes. Nothing gets sent to an external API.",
    detail: "12 documents indexed",
  },
  {
    id: "chunking",
    label: "Chunking",
    icon: "chunking",
    description:
      "Documents are divided into smaller, overlapping chunks so the model can retrieve precise fragments instead of whole files.",
    detail: "1,482 chunks · 512 tokens · 15% overlap",
  },
  {
    id: "embeddings",
    label: "Embeddings",
    icon: "embeddings",
    description:
      "Each chunk is converted into a vector — a list of numbers that captures its meaning, not just its keywords.",
    detail: "BGE-M3 · 1,024 dimensions",
  },
  {
    id: "vector-store",
    label: "Vector Store",
    icon: "vector-store",
    description:
      "Vectors are stored in an index that finds semantically similar pieces at scale, locally on your machine.",
    detail: "Qdrant · HNSW index",
  },
  {
    id: "retrieval",
    label: "Retrieval",
    icon: "retrieval",
    description:
      "Finds the most semantically relevant chunks for a user's question by comparing the question's embedding against the stored vectors.",
    detail: "top 5 · similarity threshold 0.60",
  },
  {
    id: "context",
    label: "Context",
    icon: "context",
    description:
      "The retrieved chunks are assembled, with their sources, into the prompt that the model will actually see.",
    detail: "3 chunks · 24% of context window",
  },
  {
    id: "llm",
    label: "Local LLM",
    icon: "llm",
    description:
      "A model running locally through Ollama generates an answer grounded in the provided context.",
    detail: "llama3.2:3b · 100% local",
  },
  {
    id: "answer",
    label: "Answer",
    icon: "answer",
    description:
      "The generated answer comes back with its sources — grounded in your documents, traceable and inspectable.",
    detail: "cited from 2 sources",
  },
];

export const mockQueryPipelineStages: PipelineStage[] = [
  {
    id: "question",
    label: "Question",
    icon: "answer",
    description: "You ask something about your knowledge base.",
    detail: "embedded as a query vector",
  },
  {
    id: "embedding",
    label: "Embedding",
    icon: "embeddings",
    description: "Your question is converted into a vector.",
    detail: "BGE-M3 · 1,024 dimensions",
  },
  {
    id: "retrieval",
    label: "Retrieval",
    icon: "retrieval",
    description: "The closest chunks are found in the vector store.",
    detail: "top 5 candidates scored",
  },
  {
    id: "context",
    label: "Context",
    icon: "context",
    description: "The best chunks become the model's context.",
    detail: "3 chunks assembled",
  },
  {
    id: "llm",
    label: "LLM",
    icon: "llm",
    description: "A local model reads the context and answers.",
    detail: "llama3.2:3b · streaming",
  },
  {
    id: "answer",
    label: "Answer",
    icon: "answer",
    description: "An answer with visible, clickable sources.",
    detail: "generated with citations",
  },
];
