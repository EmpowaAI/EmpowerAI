
import { motion } from 'framer-motion';
import { Wand2, Sparkles, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

interface CVRevampSectionProps {
  isRevamping: boolean;
  onRevamp: () => void;
}

export default function CVRevampSection({
  isRevamping,
  onRevamp,
}: CVRevampSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border overflow-hidden"
    >
      {/* Gradient header */}
      <div
        className="relative overflow-hidden px-6 py-6 text-white"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="pointer-events-none absolute inset-0 ai-grid opacity-10" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-15" aria-hidden />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 mb-3">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Targets 95%+ ATS score
            </div>
            <h3 className="font-display font-bold text-lg leading-tight">Revamp Your CV with AI</h3>
            <p className="text-white/70 text-sm mt-1.5 max-w-sm leading-relaxed">
              AI rewrites your CV with stronger action verbs, industry keywords, and ATS-friendly formatting.
            </p>
          </div>
          <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Wand2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-card px-6 py-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground flex-1">
          {['ATS-optimised structure', 'Stronger action verbs', 'Download as PDF or DOCX'].map((point) => (
            <span key={point} className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-secondary flex-shrink-0" />
              {point}
            </span>
          ))}
        </div>
        <button
          onClick={onRevamp}
          disabled={isRevamping}
          className="shimmer flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{ background: 'var(--gradient-hero)' }}
        >
          {isRevamping ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Rewriting…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Revamp My CV
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
