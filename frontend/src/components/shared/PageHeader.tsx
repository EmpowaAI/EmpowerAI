import type { ElementType, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
  /** Small uppercase label above the title - shown in secondary (orange) */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Lucide icon rendered in an orange pill to the left of the title */
  icon?: ElementType;
  /** Small badge rendered inline with the title (e.g. "42 live") */
  badge?: string | number;
  /** Optional button / action rendered on the right on desktop */
  action?: ReactNode;
  className?: string;
  /** "left" (default) or "center" */
  align?: "left" | "center";
}

/**
 * Shared page-level heading used on every dashboard page.
 * Keeps eyebrow / title / subtitle / action aligned consistently
 * across Dashboard, CV Analyzer, Interview Coach, and Opportunities.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  className,
  align = "left",
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        action && !centered && "sm:flex-row sm:items-start sm:justify-between",
        centered && "items-center text-center",
        className
      )}
    >
      <div className={cn("space-y-1.5", centered && "text-center")}>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            {eyebrow}
          </p>
        )}

        <div className={cn("flex items-center gap-3", centered && "justify-center")}>
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Icon className="h-5 w-5" />
            </span>
          )}

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl leading-tight">
              {title}
            </h1>
            {badge !== undefined && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 mt-0.5">{action}</div>}
    </div>
  );
}
