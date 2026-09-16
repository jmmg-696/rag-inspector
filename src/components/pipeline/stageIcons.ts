import {
  Binary,
  Cpu,
  Database,
  FileText,
  Layers,
  MessageSquareText,
  ScanSearch,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import type { StageIconKey } from "../../types/domain";

export const stageIcons: Record<StageIconKey, LucideIcon> = {
  documents: FileText,
  chunking: Scissors,
  embeddings: Binary,
  "vector-store": Database,
  retrieval: ScanSearch,
  context: Layers,
  llm: Cpu,
  answer: MessageSquareText,
};
