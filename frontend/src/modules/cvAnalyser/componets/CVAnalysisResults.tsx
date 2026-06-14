
import { motion } from 'framer-motion';
import {
  AlertTriangle, RefreshCw,
  TrendingUp, Shield, Target, Brain,
  User, Briefcase, BookOpen, Star, Zap, Sparkles,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { CVAnalysis } from '../types';

interface CVAnalysisResultProps {
  analysis: CVAnalysis;
  isFallback: boolean;
  onRevampClick: () => void;
  onReanalyze: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 85) return 'text-green-500';
  if (score >= 70) return 'text-amber-500';
  if (score >= 50) return 'text-orange-500';
  return 'text-red-500';
}

function getReadinessLabel(score: number) {
  if (score >= 85) return 'EXCEPTIONAL';
  if (score >= 70) return 'HIGH POTENTIAL';
  if (score >= 50) return 'INTERMEDIATE';
  if (score >= 35) return 'DEVELOPING';
  return 'NEEDS WORK';
}

function getReadinessBg(score: number) {
  if (score >= 85) return 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30';
  if (score >= 70) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  if (score >= 50) return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
  return 'bg-red-500/15 text-red-500 border-red-500/30';
}

// ── Circular score ring ────────────────────────────────────────────────────
const R = 46, SW = 10, SZ = 120, CX = SZ / 2;
const CIRC = 2 * Math.PI * R;

function ScoreRing({ score }: { score: number }) {
  const fill = (score / 100) * CIRC;
  return (
    <div className="relative flex-shrink-0" style={{ width: SZ, height: SZ }}>
      <svg
        width={SZ} height={SZ}
        className="absolute top-0 left-0 -rotate-90"
        style={{ transformOrigin: 'center' }}
        aria-hidden
      >
        <defs>
          <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(218 64% 28%)" />
            <stop offset="100%" stopColor="hsl(22 95% 55%)" />
          </linearGradient>
        </defs>
        <circle cx={CX} cy={CX} r={R} strokeWidth={SW} fill="none" className="stroke-muted" />
        <motion.circle
          cx={CX} cy={CX} r={R} strokeWidth={SW} fill="none"
          strokeLinecap="round"
          stroke="url(#scoreRingGrad)"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC - fill }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={cn('font-display font-bold text-3xl leading-none', getScoreColor(score))}
        >
          {score}
        </motion.span>
        <span className="text-[11px] text-muted-foreground font-medium mt-1">/ 100</span>
      </div>
    </div>
  );
}

// ── Score bar ──────────────────────────────────────────────────────────────
function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-bold tabular-nums', getScoreColor(value))}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: 'var(--gradient-hero)' }}
        />
      </div>
    </div>
  );
}

// ── Tag list ───────────────────────────────────────────────────────────────
function TagList({ items, variant = 'default' }: { items: string[]; variant?: 'default' | 'danger' | 'warning' | 'success' }) {
  if (!items?.length) return null;
  const colors = {
    default:  'bg-muted/40 text-muted-foreground border-border/40',
    danger:   'bg-destructive/10 text-destructive border-destructive/20',
    warning:  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    success:  'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={cn('px-2.5 py-1 rounded-full text-xs border', colors[variant])}>
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────
type AccentColor = 'default' | 'success' | 'warning' | 'danger' | 'info';
const accentBorder: Record<AccentColor, string> = {
  default: 'border-l-primary/30',
  success: 'border-l-green-500',
  warning: 'border-l-amber-500',
  danger:  'border-l-destructive',
  info:    'border-l-primary',
};

function Section({
  title, icon, children, accent = 'default', className,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: AccentColor;
  className?: string;
}) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-4 space-y-3 border-l-[3px]',
      accentBorder[accent],
      className
    )}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function CVAnalysisResult({
  analysis,
  isFallback,
  onRevampClick,
  onReanalyze,
}: CVAnalysisResultProps) {
  const readiness = getReadinessLabel(analysis.overallScore);
  const allRecommendations = [
    ...(analysis.improvementsCritical || []),
    ...(analysis.improvementsHighPriority || []),
    ...(analysis.improvementsNiceToHave || []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Notices */}
      {isFallback && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>AI service temporarily unavailable. Showing basic CV insights based on text analysis.</p>
        </div>
      )}

      {/* ── Score hero card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border overflow-hidden">

        {/* Gradient header */}
        <div className="relative overflow-hidden px-6 py-5 text-white" style={{ background: 'var(--gradient-hero)' }}>
          <div className="pointer-events-none absolute inset-0 ai-mesh opacity-10" aria-hidden />
          <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-15" aria-hidden />
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold text-base leading-tight">Analysis Complete</p>
                <p className="text-white/65 text-xs mt-0.5">Your CV has been fully reviewed</p>
              </div>
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full border text-xs font-bold tracking-wide',
              getReadinessBg(analysis.overallScore)
            )}>
              {readiness}
            </span>
          </div>
        </div>

        {/* Score metrics row */}
        <div className="bg-card px-6 py-5 flex flex-col sm:flex-row items-center gap-5 border-b border-border/40">
          <ScoreRing score={analysis.overallScore} />

          <div className="hidden sm:block w-px h-20 bg-border/50 self-center flex-shrink-0" />

          <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center sm:justify-start">
            <div className="text-center sm:text-left">
              <p className={cn('font-display font-bold text-2xl leading-none', getScoreColor(analysis.atsScore))}>
                {analysis.atsScore}
              </p>
              {analysis.atsGrade && (
                <p className="text-xs font-bold text-primary mt-0.5">{analysis.atsGrade}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">ATS Score</p>
            </div>
            {analysis.jobMatchPercent !== null && (
              <div className="text-center sm:text-left">
                <p className={cn('font-display font-bold text-2xl leading-none', getScoreColor(analysis.jobMatchPercent))}>
                  {analysis.jobMatchPercent}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Job Match</p>
              </div>
            )}
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1.5">Overall Score</p>
              <span className={cn(
                'text-xs font-bold px-2.5 py-1 rounded-full border',
                getReadinessBg(analysis.overallScore)
              )}>
                {readiness}
              </span>
            </div>
          </div>
        </div>

        {/* Score breakdown bars */}
        {analysis.scoreBreakdown && (
          <div className="bg-card px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-border/40">
            <ScoreBar label="Formatting"      value={analysis.scoreBreakdown.formatting} />
            <ScoreBar label="Content Quality" value={analysis.scoreBreakdown.contentQuality} />
            <ScoreBar label="Readability"     value={analysis.scoreBreakdown.readability} />
            <ScoreBar label="Professionalism" value={analysis.scoreBreakdown.professionalism} />
            <ScoreBar label="Grammar"         value={analysis.scoreBreakdown.grammar} />
          </div>
        )}

        {/* Action buttons */}
        <div className="bg-card px-6 py-4 flex flex-wrap gap-3">
          <button
            onClick={onRevampClick}
            className="flex-1 sm:flex-none shimmer flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            style={{ background: 'var(--gradient-hero)' }}
          >
            <Zap className="h-4 w-4" />
            Revamp My CV
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            onClick={onReanalyze}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground border border-border hover:bg-muted/40 hover:text-foreground transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New Analysis
          </button>
        </div>
      </div>

      {/* ── Insight grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!!analysis.topStrengths?.length && (
          <Section title="Top Strengths" icon={<Star className="h-3.5 w-3.5" />} accent="success">
            <TagList items={analysis.topStrengths} variant="success" />
          </Section>
        )}

        {!!analysis.skillGaps?.length && (
          <Section title="Skill Gaps" icon={<Target className="h-3.5 w-3.5" />} accent="warning">
            <TagList items={analysis.skillGaps} variant="warning" />
          </Section>
        )}

        {analysis.missingKeywords?.critical?.length > 0 && (
          <Section title="Missing Keywords" icon={<Shield className="h-3.5 w-3.5" />} accent="danger">
            <div className="space-y-2.5">
              {analysis.missingKeywords.critical.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-semibold">Critical</p>
                  <TagList items={analysis.missingKeywords.critical} variant="danger" />
                </div>
              )}
              {analysis.missingKeywords.recommended?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-semibold">Recommended</p>
                  <TagList items={analysis.missingKeywords.recommended} variant="warning" />
                </div>
              )}
            </div>
          </Section>
        )}

        {(analysis.missingSections?.length > 0 || analysis.formattingProblems?.length > 0) && (
          <Section title="ATS Issues" icon={<AlertTriangle className="h-3.5 w-3.5" />} accent="danger">
            {analysis.missingSections?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-semibold">Missing sections</p>
                <TagList items={analysis.missingSections} variant="danger" />
              </div>
            )}
            {analysis.formattingProblems?.length > 0 && (
              <ul className="space-y-1 mt-2">
                {analysis.formattingProblems.map((p, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5 flex-shrink-0">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {analysis.recruiterVerdict && (
          <Section title="Recruiter Verdict" icon={<Briefcase className="h-3.5 w-3.5" />} accent="info">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{analysis.recruiterVerdict}"
            </p>
          </Section>
        )}

        {analysis.candidateInfo && (
          <Section title="Detected Info" icon={<User className="h-3.5 w-3.5" />} accent="default">
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {analysis.candidateInfo.fullName  && <p><span className="font-semibold text-foreground">Name</span>  · {analysis.candidateInfo.fullName}</p>}
              {analysis.candidateInfo.email     && <p><span className="font-semibold text-foreground">Email</span> · {analysis.candidateInfo.email}</p>}
              {analysis.candidateInfo.phone     && <p><span className="font-semibold text-foreground">Phone</span> · {analysis.candidateInfo.phone}</p>}
              {analysis.candidateInfo.location  && <p><span className="font-semibold text-foreground">Location</span> · {analysis.candidateInfo.location}</p>}
              <div className="flex gap-2 flex-wrap pt-1">
                {(['linkedin', 'github', 'portfolio'] as const).map((key) => {
                  const present = analysis.candidateInfo.links?.[key];
                  return (
                    <span
                      key={key}
                      className={cn(
                        'px-2 py-0.5 rounded-full border text-xs capitalize font-medium',
                        present
                          ? 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10'
                          : 'border-border text-muted-foreground/40'
                      )}
                    >
                      {key} {present ? '✓' : '✗'}
                    </span>
                  );
                })}
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* ── Recommendations ─────────────────────────────────────────── */}
      {allRecommendations.length > 0 && (
        <Section title="Improvement Recommendations" icon={<TrendingUp className="h-3.5 w-3.5" />} accent="info">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {analysis.improvementsCritical?.map((rec, i) => (
              <div key={`c-${i}`} className="flex items-start gap-2 text-xs p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                <span className="text-destructive font-bold flex-shrink-0 mt-0.5 text-sm leading-none">!</span>
                <span className="text-muted-foreground">{rec}</span>
              </div>
            ))}
            {analysis.improvementsHighPriority?.map((rec, i) => (
              <div key={`h-${i}`} className="flex items-start gap-2 text-xs p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5 text-sm leading-none">↑</span>
                <span className="text-muted-foreground">{rec}</span>
              </div>
            ))}
            {analysis.improvementsNiceToHave?.map((rec, i) => (
              <div key={`n-${i}`} className="flex items-start gap-2 text-xs p-3 rounded-xl bg-primary/5 border border-primary/10">
                <span className="text-primary/70 font-bold flex-shrink-0 mt-0.5 text-sm leading-none">+</span>
                <span className="text-muted-foreground">{rec}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Grammar ─────────────────────────────────────────────────── */}
      {analysis.grammarQuality && (
        <Section title="Grammar & Language" icon={<BookOpen className="h-3.5 w-3.5" />} accent="default">
          <p className="text-xs font-semibold text-foreground">{analysis.grammarQuality}</p>
          {analysis.grammarIssues?.length > 0 && (
            <ul className="space-y-1 mt-1">
              {analysis.grammarIssues.slice(0, 5).map((issue: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </motion.div>
  );
}
