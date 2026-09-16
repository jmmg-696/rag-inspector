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
import type { TranslationKey } from "../../i18n";

export interface NavItem {
  labelKey: TranslationKey;
  to: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { labelKey: "nav.overview", to: "/", icon: LayoutDashboard },
  { labelKey: "nav.documents", to: "/documents", icon: FileText },
  { labelKey: "nav.playground", to: "/playground", icon: FlaskConical },
  { labelKey: "nav.retrieval", to: "/retrieval", icon: Radar },
  { labelKey: "nav.evaluation", to: "/evaluation", icon: Gauge },
];

export const learnNav: NavItem[] = [
  { labelKey: "nav.howRagWorks", to: "/learn", icon: BookOpen },
  { labelKey: "nav.chunking", to: "/learn#chunking", icon: Scissors },
  { labelKey: "nav.embeddings", to: "/learn#embeddings", icon: Binary },
  { labelKey: "nav.vectorSearch", to: "/learn#vector-search", icon: Radar },
];
