import { cn } from "../../lib/utils";

interface StatusPillProps {
  label: string;
  tone?: "success" | "neutral" | "warning";
}

const toneClasses: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  neutral: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-400/30",
};

export default function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        toneClasses[tone]
      )}
    >
      {label}
    </span>
  );
}