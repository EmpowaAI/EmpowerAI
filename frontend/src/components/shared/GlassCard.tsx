import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "pink" | "green" | "gold" | "none";
  hover?: boolean;
  delay?: number;
  animate?: boolean;
}

export default function GlassCard({
  children,
  className,
  glow = "none",
  hover = true,
  delay = 0,
  animate = true,
}: GlassCardProps) {
  const glowClass = {
    cyan: "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]",
    purple: "shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.3)]",
    pink: "shadow-[0_0_30px_-5px_hsl(var(--destructive)/0.3)]",
    green: "shadow-[0_0_30px_-5px_hsl(var(--success)/0.3)]",
    gold: "shadow-[0_0_30px_-5px_hsl(var(--sa-gold)/0.3)]",
    none: "",
  };

  const content = animate ? (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  ) : (
    children
  );

  return (
    <div
      className={cn(
        "rounded-2xl p-6 bg-card/60 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]",
        glowClass[glow],
        hover &&
          "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {content}
    </div>
  );
}
