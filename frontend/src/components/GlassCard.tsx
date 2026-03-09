import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import {type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "pink" | "green" | "none";
  hover?: boolean;
  delay?: number;
}

export default function GlassCard({ 
  children, className, glow = "none", hover = true, delay = 0 
}: GlassCardProps) {
  const glowClass = {
    cyan: "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]",
    purple: "shadow-[0_0_30px_-5px_hsl(var(--secondary)/0.3)]",
    pink: "shadow-[0_0_30px_-5px_hsl(var(--destructive)/0.3)]",
    green: "shadow-[0_0_30px_-5px_hsl(var(--success)/0.3)]",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6",
        glowClass[glow],
        hover && "transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
