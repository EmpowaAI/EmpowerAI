import { cn } from "../../lib/utils";

interface StatusPillProps {
  label: string;
  tone?: "success" | "neutral" | "warning";
}

const toneClasses: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  neutral: "bg-primary/15 text-primary border-primary/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const LIVE_LABEL_PATTERN = /\b(live|active|online)\b/i;

export default function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  const showPulse = LIVE_LABEL_PATTERN.test(label);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm border",
        toneClasses[tone]
      )}
    >
      {showPulse && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  );
}
