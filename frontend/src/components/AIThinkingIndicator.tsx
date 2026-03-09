import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";

interface AIThinkingIndicatorProps {
  messages: string[];
  isVisible: boolean;
}

export default function AIThinkingIndicator({ messages, isVisible }: AIThinkingIndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass-panel p-4 flex items-center gap-3"
        >
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary ai-thinking-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full animate-pulse-neon" />
          </div>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {messages.slice(-1).map((msg) => (
                <motion.p
                  key={msg}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-sm text-muted-foreground"
                >
                  {msg}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
