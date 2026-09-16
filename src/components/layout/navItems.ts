import {
  BookOpen,
  Binary,
  FileText,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Radar,
  Scissors,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Documents", to: "/documents", icon: FileText },
  { label: "Playground", to: "/playground", icon: FlaskConical },
  { label: "Retrieval", to: "/retrieval", icon: Radar },
  { label: "Evaluation", to: "/evaluation", icon: Gauge },
];

export const learnNav: NavItem[] = [
  { label: "How RAG works", to: "/learn", icon: BookOpen },
  { label: "Chunking", to: "/learn#chunking", icon: Scissors },
  { label: "Embeddings", to: "/learn#embeddings", icon: Binary },
  { label: "Vector Search", to: "/learn#vector-search", icon: Radar },
];
