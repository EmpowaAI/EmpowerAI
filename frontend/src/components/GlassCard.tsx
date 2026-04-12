import { cn } from "../../src/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}
