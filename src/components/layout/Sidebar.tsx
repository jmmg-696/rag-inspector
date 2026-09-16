import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "../../lib/cn";
import { LogoMark } from "./Logo";
import { NavList } from "./NavList";
import { ThemeToggle } from "./ThemeToggle";

export const SIDEBAR_COLLAPSED_KEY = "rag-inspector:sidebar-collapsed";

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage(
    SIDEBAR_COLLAPSED_KEY,
    false
  );

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 border-b border-line px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <LogoMark size={26} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">
              RAG <span className="text-accent">Inspector</span>
            </p>
            <p className="truncate font-mono text-[9px] uppercase tracking-widest text-faint">
              Visual RAG playground
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <NavList collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "flex items-center border-t border-line px-3 py-3",
          collapsed ? "flex-col gap-2" : "justify-between"
        )}
      >
        <span
          className={cn("flex items-center gap-2", collapsed && "flex-col")}
          title="Local mode — everything runs on your machine"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          {!collapsed && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Local
            </span>
          )}
        </span>
        <span className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </span>
      </div>
    </aside>
  );
}
