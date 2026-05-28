import { cn } from "../../lib/utils";

interface StatusPillProps {
  label: string;
  tone?: "success" | "neutral" | "warning" | "error" | "info";
  live?: boolean;
}

const toneClasses: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  neutral:  "bg-slate-500/15 text-slate-400 border-slate-500/20",
  warning:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
  error:    "bg-destructive/15 text-red-400 border-destructive/20",
  info:     "bg-primary/15 text-primary border-primary/20",
};

export default function StatusPill({ label, tone = "neutral", live = false }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm border",
        toneClasses[tone]
      )}
    >
      {live && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  );
}
