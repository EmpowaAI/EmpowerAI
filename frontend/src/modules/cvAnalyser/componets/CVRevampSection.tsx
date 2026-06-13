
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Lock, ArrowRight, Loader2, Crown, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CVRevampSectionProps {
  isSubscribed: boolean;
  isRevamping: boolean;
  onRevamp: () => void;
}

export default function CVRevampSection({
  isSubscribed,
  isRevamping,
  onRevamp,
}: CVRevampSectionProps) {

  // ── Not subscribed ────────────────────────────────────────────────────
  if (!isSubscribed) {
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
          <div className="pointer-events-none absolute inset-0 ai-mesh opacity-10" aria-hidden />
          <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90 mb-3">
                <Crown className="h-3 w-3 text-amber-300" />
                Premium Feature
              </div>
              <h3 className="font-display font-bold text-lg leading-tight">
                Unlock AI CV Revamp
              </h3>
              <p className="text-white/70 text-sm mt-1.5 max-w-sm leading-relaxed">
                Get an ATS-optimised, keyword-rich CV rewritten by AI — ready to send to employers.
              </p>
            </div>
            <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Feature tiles + CTA */}
        <div className="bg-card px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: CheckCircle, text: 'ATS-optimised formatting',  sub: 'Pass every ATS filter'       },
              { icon: Sparkles,    text: 'Keyword-rich rewrite',       sub: 'Industry-relevant language'  },
              { icon: ArrowRight,  text: 'PDF & DOCX download',        sub: 'Ready to send instantly'     },
            ].map(({ icon: Icon, text, sub }) => (
              <div
                key={text}
                className="flex flex-col gap-1.5 px-3.5 py-3 rounded-xl bg-primary/5 border border-primary/10"
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight">{text}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{sub}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <Link
              to="/dashboard/subscription"
              className="shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <Crown className="h-4 w-4" />
              Upgrade to Premium
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-muted-foreground/60 text-center">
              Cancel anytime · Instant access after upgrade
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Subscribed: revamp trigger ─────────────────────────────────────────
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
