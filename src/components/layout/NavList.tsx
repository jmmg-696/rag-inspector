import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import { learnNav, primaryNav, type NavItem } from "./navItems";
import { cn } from "../../lib/cn";

function NavButton({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  const location = useLocation();
  const [path, hash] = item.to.split("#");
  const label = t(item.labelKey);
  const active =
    location.pathname === (path || "/") &&
    (location.hash || "") === (hash ? `#${hash}` : "");
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-muted hover:bg-elevated hover:text-ink"
      )}
    >
      <Icon size={16} aria-hidden="true" className="shrink-0" />
      <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
    </Link>
  );
}

export function NavList({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("nav.mainLabel")} className="flex flex-col gap-0.5 px-2">
      {primaryNav.map((item) => (
        <NavButton
          key={item.to}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}

      <div className="my-3 border-t border-line" aria-hidden="true" />

      {!collapsed && (
        <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-faint">
          {t("nav.learn")}
        </p>
      )}

      {learnNav.map((item) => (
        <NavButton
          key={item.to}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
