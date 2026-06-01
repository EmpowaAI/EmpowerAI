import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, FileText } from "lucide-react";

interface CVScanAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

const scanSteps = [
  { text: "Parsing experience...", status: "OK" },
  { text: "Cross-referencing skills with job market...", status: "OK" },
  { text: "Identifying weak keyword density...", status: "WARN" },
  { text: "Evaluating action verb usage...", status: "OK" },
  { text: "Checking profile link presence...", status: "PARTIAL" },
  { text: "Generating strength report...", status: "OK" },
];

export default function CVScanAnimation({ isActive, onComplete }: CVScanAnimationProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [scanLinePos, setScanLinePos] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    setCompletedSteps([]);
    setCurrentStep(0);
    let step = 0;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, step]);
      step++;
      if (step >= scanSteps.length) {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 800);
      } else {
        setCurrentStep(step);
      }
    }, 1100);
    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setScanLinePos((p) => (p >= 100 ? 0 : p + 2));
    }, 40);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel-strong p-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="relative flex flex-col lg:flex-row gap-8 items-start">
        <div className="relative flex-shrink-0 mx-auto lg:mx-0">
          <div className="relative w-48 h-64 rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
            <div className="p-4 space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-2 rounded-full bg-border/40" style={{ width: `${60 + Math.random() * 35}%` }} />
              ))}
            </div>
            <motion.div
              className="absolute left-0 right-0 h-1"
              style={{
                top: `${scanLinePos}%`,
                background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.8), transparent)",
                boxShadow: "0 0 20px 4px hsl(var(--neon-cyan) / 0.3)",
              }}
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary"
                animate={{
                  x: [Math.random() * 180, Math.random() * 180],
                  y: [Math.random() * 240, Math.random() * 240],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
            <div className="absolute inset-0 border-2 border-primary/20 rounded-xl" />
          </div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center neon-glow-cyan"
          >
            <Brain className="h-5 w-5 text-primary" />
          </motion.div>
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">AI Analysis Terminal</span>
          </div>
          <div className="space-y-2 font-mono text-sm">
            {scanSteps.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isCurrent = currentStep === i && !isCompleted;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isCompleted || isCurrent ? { opacity: 1, x: 0 } : { opacity: 0.2 }}
                  className="flex items-center gap-3"
                >
                  {isCompleted ? (
                    <span className={
                      step.status === "OK" ? "text-neon-green" :
                      step.status === "WARN" ? "text-neon-orange" : "text-secondary"
                    }>[{step.status}]</span>
                  ) : isCurrent ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="text-primary"
                    >[...]</motion.span>
                  ) : (
                    <span className="text-muted-foreground/30">[---]</span>
                  )}
                  <span className={
                    isCompleted ? "text-muted-foreground" :
                    isCurrent ? "text-foreground" : "text-muted-foreground/30"
                  }>{step.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
