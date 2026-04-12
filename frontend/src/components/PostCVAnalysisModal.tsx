import { motion } from 'framer-motion';
import { X, Sparkles, Wand2, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface PostCVAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvScore: number;
  readinessLevel: string;
  twinCompleted?: boolean;
  onRevampClick?: () => void;
}

export default function PostCVAnalysisModal({
  isOpen,
  onClose,
  cvScore,
  readinessLevel,
  twinCompleted = false,
  onRevampClick,
}: PostCVAnalysisModalProps) {
  // Only show modal if CV score is below threshold (75) or if explicitly needed
  const shouldShow = isOpen && (cvScore < 75 || twinCompleted);
  if (!shouldShow) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'EXCEPTIONAL': return 'text-green-500';
      case 'HIGH POTENTIAL': return 'text-amber-500';
      case 'INTERMEDIATE': return 'text-blue-500';
      case 'DEVELOPING': return 'text-orange-500';
      default: return 'text-red-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl max-w-lg w-full border border-border/40 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-amber-500/10 px-6 py-6 border-b border-border/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">CV Analysis Complete!</h2>
              <p className="text-sm text-muted-foreground">Your career profile is ready</p>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className={cn("text-3xl font-bold", getScoreColor(cvScore))}>
                {cvScore}
              </div>
              <div className="text-xs text-muted-foreground">CV Score</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className={cn("text-sm font-semibold", getReadinessColor(readinessLevel))}>
                {readinessLevel}
              </div>
              <div className="text-xs text-muted-foreground">Readiness</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Great work! Your CV has been analyzed. Now choose your next step to maximize your career potential.
          </p>

          <div className="space-y-3">
            {/* Revamp CV Option */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <button
                onClick={() => {
                  onRevampClick?.();
                  onClose();
                }}
                className="w-full p-4 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group-hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all">
                    <Wand2 className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Revamp Your CV</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Get an AI-optimized version with ATS-friendly formatting and improved content
                    </p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <Sparkles className="h-3 w-3" />
                      Boost to 95%+ ATS score
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </motion.div>

            {/* Build Twin Option */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <Link
                to="/dashboard/twin"
                onClick={onClose}
                className="block w-full p-4 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group-hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg group-hover:from-primary/30 group-hover:to-blue-500/30 transition-all">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Build Your Digital Twin</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Create your AI career advisor with personalized insights, market analysis, and growth recommendations
                    </p>
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Sparkles className="h-3 w-3" />
                      Unlock advanced AI features
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Footer with 'Maybe Later' */}
          <div className="mt-6 pt-4 border-t border-border/40 space-y-3">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              Maybe later
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Access these options anytime from your dashboard
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}