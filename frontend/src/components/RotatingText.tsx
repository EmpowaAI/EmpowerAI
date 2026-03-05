"use client";

import { AnimatePresence, motion } from "framer-motion";

interface RotatingTextProps {
  text: string;
  langKey: number;
  className?: string;
  as?: "span" | "p" | "em";
  languageLabel?: string;
}

export default function RotatingText({
  text,
  langKey,
  className = "",
  as = "span",
  languageLabel,
}: RotatingTextProps) {
  const Tag = as;

  return (
    <span className="relative inline-flex flex-col items-start">
      <AnimatePresence mode="wait">
        <motion.span
          key={`${langKey}-${text}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="inline-flex flex-col"
        >
          <Tag className={className}>{text}</Tag>
          {languageLabel && (
            <span className="text-[10px] text-muted-foreground/60 font-normal tracking-wide mt-0.5">
              {languageLabel}
            </span>
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
