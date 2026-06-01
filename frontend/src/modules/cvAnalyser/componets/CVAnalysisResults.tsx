
import { motion } from 'framer-motion';
import {
   AlertTriangle, Info, RefreshCw,
  TrendingUp, Shield, Target, ChevronRight,
  User, Briefcase, BookOpen, Star, Zap,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { CVAnalysis } from '../types';

interface CVAnalysisResultProps {
  analysis: CVAnalysis;
  isFallback: boolean;
  analysisRemaining: number | null;
  onRevampClick: () => void;
  onReanalyze: () => void;
  isSubscribed: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 85) return 'text-green-500';
  if (score >= 70) return 'text-amber-500';
  if (score >= 50) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBg(score: number) {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-amber-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

function getReadinessLabel(score: number): string {
  if (score >= 85) return 'EXCEPTIONAL';
  if (score >= 70) return 'HIGH POTENTIAL';
  if (score >= 50) return 'INTERMEDIATE';
  if (score >= 35) return 'DEVELOPING';
  return 'NEEDS WORK';
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-semibold', getScoreColor(value))}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', getScoreBg(value))}
        />
      </div>
    </div>
  );
}

function TagList({ items, variant = 'default' }: { items: string[]; variant?: 'default' | 'danger' | 'warning' | 'success' }) {
  if (!items?.length) return null;
  const colors = {
    default: 'bg-muted/40 text-muted-foreground border-border/40',
    danger: 'bg-destructive/10 text-destructive border-destructive/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    success: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
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

function Section({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 space-y-3', className)}>
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
  analysisRemaining,
  onRevampClick,
  onReanalyze,
  isSubscribed,
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
      {/* Fallback notice */}
      {isFallback && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>AI service is temporarily unavailable. Showing basic CV insights based on text analysis.</p>
        </div>
      )}

      {/* Analysis remaining notice */}
      {!isSubscribed && analysisRemaining !== null && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
          <Info className="h-4 w-4 flex-shrink-0" />
          <p>You have <strong>{analysisRemaining}</strong> free analysis{analysisRemaining !== 1 ? 'es' : ''} remaining.</p>
        </div>
      )}

      {/* Score header */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 px-6 py-6 border-b border-border/40">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Overall score circle */}
            <div className="text-center flex-shrink-0">
              <div className={cn('text-5xl font-bold', getScoreColor(analysis.overallScore))}>
                {analysis.overallScore}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Overall Score</div>
            </div>

            <div className="w-px h-12 bg-border hidden sm:block self-center" />

            {/* ATS + readiness */}
            <div className="flex gap-6 text-center">
              <div>
                <div className={cn('text-2xl font-bold', getScoreColor(analysis.atsScore))}>
                  {analysis.atsScore}
                </div>
                <div className="text-xs text-muted-foreground">ATS Score</div>
                {analysis.atsGrade && (
                  <div className="text-xs font-semibold text-primary mt-0.5">{analysis.atsGrade}</div>
                )}
              </div>
              {analysis.jobMatchPercent !== null && (
                <div>
                  <div className={cn('text-2xl font-bold', getScoreColor(analysis.jobMatchPercent))}>
                    {analysis.jobMatchPercent}%
                  </div>
                  <div className="text-xs text-muted-foreground">Job Match</div>
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-secondary">{readiness}</div>
                <div className="text-xs text-muted-foreground">Readiness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        {analysis.scoreBreakdown && (
          <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ScoreBar label="Formatting" value={analysis.scoreBreakdown.formatting} />
            <ScoreBar label="Content Quality" value={analysis.scoreBreakdown.contentQuality} />
            <ScoreBar label="Readability" value={analysis.scoreBreakdown.readability} />
            <ScoreBar label="Professionalism" value={analysis.scoreBreakdown.professionalism} />
            <ScoreBar label="Grammar" value={analysis.scoreBreakdown.grammar} />
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onRevampClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <Zap className="h-4 w-4" />
          Revamp My CV
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={onReanalyze}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all border border-border"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          New Analysis
        </button>
      </div>

      {/* Grid of sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strengths */}
        {!!analysis.topStrengths?.length && (
          <Section title="Top Strengths" icon={<Star className="h-3.5 w-3.5" />}>
            <TagList items={analysis.topStrengths} variant="success" />
          </Section>
        )}

        {/* Skill gaps */}
        {!!analysis.skillGaps?.length && (
          <Section title="Skill Gaps" icon={<Target className="h-3.5 w-3.5" />}>
            <TagList items={analysis.skillGaps} variant="warning" />
          </Section>
        )}

        {/* Missing keywords */}
        {analysis.missingKeywords?.critical?.length > 0 && (
          <Section title="Missing Keywords" icon={<Shield className="h-3.5 w-3.5" />}>
            <div className="space-y-2">
              {analysis.missingKeywords.critical.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Critical</p>
                  <TagList items={analysis.missingKeywords.critical} variant="danger" />
                </div>
              )}
              {analysis.missingKeywords.recommended?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Recommended</p>
                  <TagList items={analysis.missingKeywords.recommended} variant="warning" />
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ATS issues */}
        {(analysis.missingSections?.length > 0 || analysis.formattingProblems?.length > 0) && (
          <Section title="ATS Issues" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
            {analysis.missingSections?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Missing sections</p>
                <TagList items={analysis.missingSections} variant="danger" />
              </div>
            )}
            {analysis.formattingProblems?.length > 0 && (
              <ul className="space-y-1 mt-2">
                {analysis.formattingProblems.map((p, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {/* Recruiter feedback */}
        {analysis.recruiterVerdict && (
          <Section title="Recruiter Verdict" icon={<Briefcase className="h-3.5 w-3.5" />}>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.recruiterVerdict}</p>
          </Section>
        )}

        {/* Candidate info */}
        {analysis.candidateInfo && (
          <Section title="Detected Info" icon={<User className="h-3.5 w-3.5" />}>
            <div className="space-y-1 text-xs text-muted-foreground">
              {analysis.candidateInfo.fullName && <p><strong>Name:</strong> {analysis.candidateInfo.fullName}</p>}
              {analysis.candidateInfo.email && <p><strong>Email:</strong> {analysis.candidateInfo.email}</p>}
              {analysis.candidateInfo.phone && <p><strong>Phone:</strong> {analysis.candidateInfo.phone}</p>}
              {analysis.candidateInfo.location && <p><strong>Location:</strong> {analysis.candidateInfo.location}</p>}
              <div className="flex gap-3 flex-wrap mt-1">
                <span className={cn('px-2 py-0.5 rounded-full border text-xs', analysis.candidateInfo.links.linkedin ? 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10' : 'border-border text-muted-foreground/50')}>
                  LinkedIn {analysis.candidateInfo.links.linkedin ? '✓' : '✗'}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full border text-xs', analysis.candidateInfo.links.github ? 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10' : 'border-border text-muted-foreground/50')}>
                  GitHub {analysis.candidateInfo.links.github ? '✓' : '✗'}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full border text-xs', analysis.candidateInfo.links.portfolio ? 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10' : 'border-border text-muted-foreground/50')}>
                  Portfolio {analysis.candidateInfo.links.portfolio ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </Section>
        )}
      </div>

      {/* Recommendations */}
      {allRecommendations.length > 0 && (
        <Section title="Improvement Recommendations" icon={<TrendingUp className="h-3.5 w-3.5" />} className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {analysis.improvementsCritical?.map((rec, i) => (
              <div key={`c-${i}`} className="flex items-start gap-2 text-xs text-muted-foreground p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                <span className="text-destructive font-bold flex-shrink-0 mt-0.5">!</span>
                {rec}
              </div>
            ))}
            {analysis.improvementsHighPriority?.map((rec, i) => (
              <div key={`h-${i}`} className="flex items-start gap-2 text-xs text-muted-foreground p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">↑</span>
                {rec}
              </div>
            ))}
            {analysis.improvementsNiceToHave?.map((rec, i) => (
              <div key={`n-${i}`} className="flex items-start gap-2 text-xs text-muted-foreground p-2.5 rounded-lg bg-muted/30 border border-border/40">
                <span className="text-primary/60 font-bold flex-shrink-0 mt-0.5">+</span>
                {rec}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Grammar */}
      {analysis.grammarQuality && (
        <Section title="Grammar & Language" icon={<BookOpen className="h-3.5 w-3.5" />}>
          <p className="text-xs font-medium text-foreground">{analysis.grammarQuality}</p>
          {analysis.grammarIssues?.length > 0 && (
            <ul className="space-y-1 mt-1">
              {analysis.grammarIssues.slice(0, 5).map((issue: string, i: number) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
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
