
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, CheckCircle, Loader2,
  FileText, Eye, Shield, Briefcase, Target, Sparkles,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface CVScanAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

const SCAN_STEPS = [
  { Icon: FileText,  label: "Parsing document structure",      phase: "Reading"    },
  { Icon: Eye,       label: "Extracting skills & experience",   phase: "Extracting" },
  { Icon: Shield,    label: "ATS compatibility check",          phase: "ATS"        },
  { Icon: Briefcase, label: "Matching job market keywords",     phase: "Matching"   },
  { Icon: Target,    label: "Analysing keyword density",        phase: "Keywords"   },
  { Icon: Sparkles,  label: "Generating your full report",      phase: "Finalising" },
];

const R = 50, SW = 10, SZ = 128, CX = SZ / 2;
const CIRC = 2 * Math.PI * R;

export default function CVScanAnimation({ isActive, onComplete }: CVScanAnimationProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    if (!isActive) return;
    setCompletedSteps([]);
    setCurrentStep(0);
    let step = 0;
    const id = setInterval(() => {
      setCompletedSteps((p) => [...p, step]);
      step++;
      if (step >= SCAN_STEPS.length) {
        clearInterval(id);
        setTimeout(() => onComplete?.(), 600);
      } else {
        setCurrentStep(step);
      }
    }, 1100);
    return () => clearInterval(id);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const pct = Math.round((completedSteps.length / SCAN_STEPS.length) * 100);
  const done = completedSteps.length === SCAN_STEPS.length;
  const dashFill = (pct / 100) * CIRC;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl border border-border overflow-hidden"
    >
      {/* ── Gradient header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-6 py-5 text-white" style={{ background: 'var(--gradient-hero)' }}>
        <div className="pointer-events-none absolute inset-0 ai-grid opacity-10" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-15" aria-hidden />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="h-10 w-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0"
            >
              <Brain className="h-5 w-5" />
            </motion.div>
            <div>
              <p className="font-display font-bold text-sm leading-tight">
                {done ? "Analysis Complete!" : "Analysing Your CV"}
              </p>
              <p className="text-white/65 text-xs mt-0.5">
                {done
                  ? "Preparing your results…"
                  : `Step ${Math.min(currentStep + 1, SCAN_STEPS.length)} of ${SCAN_STEPS.length}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <motion.p
              key={pct}
              initial={{ scale: 0.85, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display font-bold text-2xl"
            >
              {pct}%
            </motion.p>
            <p className="text-white/55 text-[11px]">complete</p>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="bg-card p-6 space-y-5">
        <div className="flex gap-6 items-start">

          {/* Circular ring */}
          <div className="flex-shrink-0 relative" style={{ width: SZ, height: SZ }}>
            <svg
              width={SZ} height={SZ}
              className="absolute top-0 left-0 -rotate-90"
              style={{ transformOrigin: 'center' }}
              aria-hidden
            >
              <defs>
                <linearGradient id="cvScanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(218 64% 28%)" />
                  <stop offset="100%" stopColor="hsl(22 95% 55%)" />
                </linearGradient>
              </defs>
              <circle cx={CX} cy={CX} r={R} strokeWidth={SW} fill="none" className="stroke-muted" />
              <motion.circle
                cx={CX} cy={CX} r={R} strokeWidth={SW} fill="none"
                strokeLinecap="round"
                stroke="url(#cvScanGrad)"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: CIRC - dashFill }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={pct}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                className="font-display font-bold text-2xl text-foreground"
              >
                {pct}%
              </motion.span>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">done</span>
            </div>
          </div>

          {/* Step list */}
          <div className="flex-1 space-y-2.5 pt-1 min-w-0">
            {SCAN_STEPS.map(({ Icon, label, phase }, i) => {
              const stepDone   = completedSteps.includes(i);
              const stepActive = currentStep === i && !stepDone;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: stepDone || stepActive ? 1 : 0.28, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  {/* Status indicator */}
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    stepDone
                      ? "bg-gradient-to-br from-primary to-secondary"
                      : stepActive
                      ? "border-2 border-secondary bg-secondary/10"
                      : "border border-border bg-muted/50"
                  )}>
                    {stepDone ? (
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    ) : stepActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-3.5 w-3.5 text-secondary" />
                      </motion.div>
                    ) : (
                      <Icon className="h-3 w-3 text-muted-foreground/30" />
                    )}
                  </div>

                  <p className={cn(
                    "flex-1 text-xs transition-colors truncate",
                    stepDone   ? "text-foreground font-medium" :
                    stepActive ? "text-secondary font-semibold" :
                                 "text-muted-foreground/40"
                  )}>
                    {label}
                  </p>

                  {stepDone && (
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      ✓
                    </span>
                  )}
                  {stepActive && (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.85, repeat: Infinity }}
                      className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full flex-shrink-0"
                    >
                      {phase}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="space-y-1.5">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-hero)' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>
              {done
                ? "All checks complete - preparing results"
                : `${completedSteps.length} of ${SCAN_STEPS.length} checks complete`}
            </span>
            <span className="font-semibold">{pct}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
