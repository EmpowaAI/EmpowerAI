
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Lock, ArrowRight, Loader2, Crown } from 'lucide-react';
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
        className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 overflow-hidden"
      >
        <div className="px-6 py-8 text-center space-y-4">
          {/* Lock icon */}
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>

          {/* Heading */}
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center justify-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              CV Revamp is a Premium Feature
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Upgrade to a subscription to unlock AI-powered CV rewriting — get an
              ATS-optimised, professionally formatted CV ready to send to employers.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto">
            {[
              { icon: '✦', text: 'ATS-optimised formatting' },
              { icon: '✦', text: 'Keyword-rich rewrite' },
              { icon: '✦', text: 'PDF & DOCX download' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10"
              >
                <span className="text-primary text-xs mt-0.5 flex-shrink-0">{item.icon}</span>
                <span className="text-xs text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Premium
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="text-xs text-muted-foreground/60">
            Cancel anytime · Instant access after upgrade
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Subscribed: show revamp trigger ────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/5 via-card to-primary/5 overflow-hidden"
    >
      <div className="px-6 py-8 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
          <Wand2 className="h-6 w-6 text-secondary" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground">Revamp Your CV with AI</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Let our AI rewrite your CV with ATS-friendly formatting, stronger action verbs,
            and industry-relevant keywords — ready to download as PDF or DOCX.
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 text-xs text-amber-500 font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Targets 95%+ ATS score
        </div>

        <button
          onClick={onRevamp}
          disabled={isRevamping}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold text-sm hover:bg-secondary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRevamping ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Rewriting your CV...
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
