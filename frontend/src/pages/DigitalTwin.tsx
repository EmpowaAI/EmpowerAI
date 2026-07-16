import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Target, Lightbulb, ChevronDown, ChevronUp,
  ArrowRight, Briefcase, BookOpen, DollarSign, Loader2,
  Sparkles, Network, CheckCircle, Zap, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { twinAPI } from "../lib/api";

type SectionKey = "skills" | "missing" | "next";

interface TwinData {
  score: number;
  marketValue: string;
  incomePotential: string;
  strongestPath: string;
  confidence: string;
  summary: string;
  coreSkills: string[];
  skillsNeedingProof: string[];
  opportunities: Array<{
    type: string;
    title: string;
    projection: string;
    nextStep: string;
  }>;
  nextSteps: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
const DEMAND_TO_MARKET_VALUE: Record<string, string> = {
  CRITICAL: "In High Demand",
  HIGH: "Growing",
  MEDIUM: "Moderate",
  LOW: "Early Stage",
};

const DEMAND_TO_CONFIDENCE: Record<string, string> = {
  CRITICAL: "High confidence",
  HIGH: "High confidence",
  MEDIUM: "Medium confidence",
  LOW: "Building confidence",
};

function formatIncomeRange(range: { min?: number; max?: number; currency?: string } | undefined): string {
  if (!range?.min || !range?.max) return "R5,000 to R15,000 / month";
  return `R${range.min.toLocaleString("en-ZA")} to R${range.max.toLocaleString("en-ZA")} / month`;
}

function mapTwinToDisplay(raw: any): TwinData {
  const identity = raw.identity || {};
  const economy = raw.economy || {};
  const skills = raw.skills || {};
  const intelligence = raw.intelligence || {};

  const score = economy.employabilityScore ?? economy.marketValueScore ?? 50;
  const demandLevel: string = economy.demandLevel ?? "MEDIUM";
  const incomePotential = formatIncomeRange(economy.incomePotentialRange);

  const coreSkills: string[] = Array.isArray(skills.core) ? skills.core.slice(0, 8) : [];
  const missingSkills: string[] = Array.isArray(skills.missing) ? skills.missing.slice(0, 8) : [];
  const emergingSkills: string[] = Array.isArray(skills.emerging) ? skills.emerging : [];
  const monetizableSkills: string[] = Array.isArray(skills.monetizable) ? skills.monetizable : [];
  const recommendations: string[] = Array.isArray(intelligence.recommendations) ? intelligence.recommendations : [];

  const opportunities = [
    {
      type: "Jobs",
      title: identity.targetRole
        ? `${identity.targetRole} roles matching your profile`
        : "Entry-level roles matching your current profile",
      projection: incomePotential,
      nextStep: recommendations[0] ?? "Improve your CV bullets with outcomes and tools used.",
    },
    {
      type: "Study & Funding",
      title: "Learnerships, bursaries, and short skills programmes",
      projection: "Can unlock better income pathways",
      nextStep: emergingSkills.length > 0
        ? `Focus on: ${emergingSkills.slice(0, 2).join(", ")}`
        : "Choose one scarce skill connected to your profile.",
    },
    {
      type: "Side Income",
      title: "Monetizable skills from your profile",
      projection: "R2,000 to R10,000 / month early potential",
      nextStep: monetizableSkills.length > 0
        ? `Package your ${monetizableSkills[0]} skills into a service offering`
        : "Package one current skill into a simple offer.",
    },
  ];

  const nextSteps = recommendations.length > 0
    ? recommendations.slice(0, 4)
    : [
        "Run your CV through the CV Analyzer.",
        "Fix your top 3 weak CV bullets.",
        "Pick one realistic opportunity path.",
        "Take one action this week.",
      ];

  const summary =
    recommendations[0] ??
    (Array.isArray(intelligence.strengths) ? intelligence.strengths[0] : undefined) ??
    "Your twin is ready. Explore your opportunities and skills below.";

  return {
    score,
    marketValue: DEMAND_TO_MARKET_VALUE[demandLevel] ?? "Growing",
    incomePotential,
    strongestPath: identity.targetRole ?? "Entry-level work + skill bridge",
    confidence: DEMAND_TO_CONFIDENCE[demandLevel] ?? "Medium confidence",
    summary,
    coreSkills,
    skillsNeedingProof: missingSkills,
    opportunities,
    nextSteps,
  };
}

function getScoreLabel(score: number) {
  if (score < 40) return "Early-stage profile";
  if (score < 60) return "Building foundation";
  if (score < 80) return "Growing potential";
  return "Opportunity-ready";
}

function getScoreColor(score: number) {
  if (score < 40) return "text-orange-500";
  if (score < 60) return "text-amber-500";
  if (score < 80) return "text-primary";
  return "text-green-500";
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
        style={{ transformOrigin: "center" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="twinScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(218 64% 28%)" />
            <stop offset="100%" stopColor="hsl(22 95% 55%)" />
          </linearGradient>
        </defs>
        <circle cx={CX} cy={CX} r={R} strokeWidth={SW} fill="none" className="stroke-muted" />
        <motion.circle
          cx={CX} cy={CX} r={R} strokeWidth={SW} fill="none"
          strokeLinecap="round"
          stroke="url(#twinScoreGrad)"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC - fill }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={cn("font-display font-bold text-3xl leading-none", getScoreColor(score))}
        >
          {score}
        </motion.span>
        <span className="text-[11px] text-muted-foreground font-medium mt-1">/ 100</span>
      </div>
    </div>
  );
}

// ── Expandable section ─────────────────────────────────────────────────────
function ExpandableSection({
  title, isOpen, onToggle, children, accent = "default",
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: "default" | "success" | "warning";
}) {
  const border = {
    default: "border-l-primary/30",
    success: "border-l-green-500",
    warning: "border-l-amber-500",
  }[accent];

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden border-l-[3px]", border)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border/40">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
const DigitalTwin = () => {
  const [selectedPrompt, setSelectedPrompt] = useState("What should I do first?");
  const [openSections, setOpenSections] = useState<SectionKey[]>(["skills", "missing", "next"]);
  const [twinData, setTwinData] = useState<TwinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchTwin() {
      try {
        setLoading(true);
        setError(null);
        const response = await twinAPI.get();
        if (cancelled) return;
        const raw = response?.data?.twin ?? response?.twin ?? null;
        setTwinData(raw ? mapTwinToDisplay(raw) : null);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load your twin.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTwin();
    return () => { cancelled = true; };
  }, []);

  const toggleSection = (section: SectionKey) =>
    setOpenSections((cur) =>
      cur.includes(section) ? cur.filter((s) => s !== section) : [...cur, section]
    );

  const guidance = useMemo(() => {
    if (selectedPrompt.includes("missing"))
      return {
        title: "Skills that need stronger proof",
        message: "You may already have some of these skills, but your profile needs clearer examples, projects, tools, or results to prove them.",
        steps: ["Add one measurable result to your CV.", "Mention the tools you used.", "Create one small project that proves the skill."],
      };
    if (selectedPrompt.includes("jobs"))
      return {
        title: "Jobs that fit your current profile",
        message: "Start with roles that match your current evidence, then use short skills training to move into better-paying paths.",
        steps: ["Apply for entry-level roles aligned to your current skills.", "Improve your CV bullets before applying.", "Track which roles keep appearing and learn the missing skill."],
      };
    if (selectedPrompt.includes("monetize"))
      return {
        title: "Ways to earn from what you already know",
        message: "Some skills can become small services before they become full careers.",
        steps: ["Pick one skill people already ask you for help with.", "Turn it into a small service offer.", "Test it with one real person or local business."],
      };
    if (selectedPrompt.includes("income"))
      return {
        title: "How to increase your income path",
        message: "Income grows when your profile shows proof, tools, outcomes, and a clearer direction.",
        steps: ["Choose one higher-value skill bridge.", "Build proof through a project or certificate.", "Update your CV with numbers and outcomes."],
      };
    return {
      title: "Your next best move",
      message: "Start by improving the proof in your CV, then compare jobs, learning paths, and side-income options.",
      steps: ["Fix your CV evidence first.", "Choose one realistic opportunity path.", "Take one action this week."],
    };
  }, [selectedPrompt]);

  const quickPrompts = [
    "What skills am I missing?",
    "What jobs fit me now?",
    "What can I monetize?",
    "How do I increase my income?",
    "What should I do first?",
  ];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-16 w-16 rounded-2xl flex items-center justify-center text-white"
          style={{ background: "var(--gradient-hero)" }}
        >
          <Network className="h-8 w-8" />
        </motion.div>
        <div className="text-center space-y-1">
          <p className="font-display font-bold text-lg text-foreground">Loading your Economic Twin</p>
          <p className="text-sm text-muted-foreground">Pulling your career profile…</p>
        </div>
        <div className="flex gap-1.5">
          {["bg-primary", "bg-secondary", "bg-primary", "bg-secondary", "bg-primary"].map((c, i) => (
            <div key={i} className={cn("h-2 w-2 rounded-full animate-pulse", c)} style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
            <Network className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Could not load your twin</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Loader2 className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── No twin yet ──────────────────────────────────────────────────────────
  if (!twinData) {
    return (
      <div className="max-w-lg mx-auto mt-12 space-y-4">
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="relative overflow-hidden px-6 py-8 text-white text-center" style={{ background: "var(--gradient-hero)" }}>
            <div className="pointer-events-none absolute inset-0 ai-mesh opacity-15" aria-hidden />
            <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
            <div className="relative z-10 space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto">
                <Network className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl font-bold">Your Economic Twin isn't built yet</h2>
              <p className="text-white/70 text-sm max-w-sm mx-auto">
                Complete your CV analysis first. Your twin is generated automatically from your CV data.
              </p>
            </div>
          </div>
          <div className="bg-card px-6 py-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard/cv-analyzer"
              className="shimmer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "var(--gradient-hero)" }}
            >
              Analyse My CV
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard/twin-builder"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted/40 transition-colors text-foreground"
            >
              Build via Chat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Opportunity icon map ─────────────────────────────────────────────────
  const oppConfig = [
    { Icon: Briefcase, gradFrom: "from-primary/20", gradTo: "to-secondary/15", text: "text-primary"    },
    { Icon: BookOpen,  gradFrom: "from-primary/15", gradTo: "to-primary/5",    text: "text-primary"    },
    { Icon: DollarSign,gradFrom: "from-secondary/20",gradTo: "to-primary/10", text: "text-secondary"   },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl text-white" style={{ background: "var(--gradient-hero)" }}>
        <div className="pointer-events-none absolute inset-0 ai-mesh opacity-15" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ai-grid opacity-10" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-25" aria-hidden />
        <div className="relative z-10 p-6 md:p-8 lg:p-10 flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 mb-3">
              <Sparkles className="h-3 w-3 text-secondary" />
              AI Career Intelligence
            </div>
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              Your <span className="text-gradient-ai">Economic Twin</span>
            </h1>
            <p className="mt-2 text-white/70 text-sm md:text-base max-w-md">
              See where your skills can take you, what proof you still need, and your next move.
            </p>
          </div>
          <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Network className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* ── 3 metric chips ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />,
            label: "Market Value",
            value: twinData.marketValue,
            sub: twinData.confidence,
            bg: "bg-green-500/8 border-green-500/20",
          },
          {
            icon: <DollarSign className="h-4 w-4 text-primary" />,
            label: "Income Potential",
            value: twinData.incomePotential,
            sub: "Can improve with a stronger CV",
            bg: "bg-primary/5 border-primary/15",
          },
          {
            icon: <Target className="h-4 w-4 text-secondary" />,
            label: "Best Current Path",
            value: twinData.strongestPath,
            sub: "Start here, then bridge higher",
            bg: "bg-secondary/8 border-secondary/20",
          },
        ].map(({ icon, label, value, sub, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-xl border p-4 space-y-1", bg)}
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
            </div>
            <p className="font-display font-bold text-sm md:text-base text-foreground leading-snug">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left panel */}
        <div className="space-y-4">

          {/* Score card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="relative overflow-hidden px-4 py-3" style={{ background: "var(--gradient-hero)" }}>
              <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
              <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-white/80">
                Employability Score
              </p>
            </div>
            <div className="p-5 flex flex-col items-center gap-3">
              <ScoreRing score={twinData.score} />
              <div className="text-center space-y-1">
                <p className={cn("font-display font-bold text-sm", getScoreColor(twinData.score))}>
                  {getScoreLabel(twinData.score)}
                </p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden w-32 mx-auto">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${twinData.score}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-hero)" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[220px] mx-auto">
                  {twinData.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Quick-action CTA */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="relative overflow-hidden px-4 py-3" style={{ background: "var(--gradient-hero)" }}>
              <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
              <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-white/80">Start Here</p>
            </div>
            <div className="p-4 space-y-2.5">
              <p className="text-xs text-muted-foreground">
                Your strongest next move is to strengthen your CV evidence before applying widely.
              </p>
              <Link
                to="/dashboard/cv-analyzer"
                className="shimmer flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--gradient-hero)" }}
              >
                <Zap className="h-4 w-4" />
                Open CV Analyzer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard/twin-builder"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted/40 transition-colors text-muted-foreground"
              >
                Chat with your Twin
              </Link>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-5">

          {/* Twin Guidance */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="relative overflow-hidden px-5 py-4 border-b border-border/40" style={{ background: "var(--gradient-hero)" }}>
              <div className="pointer-events-none absolute inset-0 ai-grid opacity-10" aria-hidden />
              <div className="relative z-10 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-white leading-tight">Twin Guidance</p>
                  <p className="text-white/60 text-xs mt-0.5">Choose what you want help with</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Prompt chips */}
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200",
                      selectedPrompt === prompt
                        ? "text-white border-transparent shadow-sm"
                        : "border-border bg-muted/40 text-muted-foreground hover:border-secondary/40 hover:text-foreground"
                    )}
                    style={selectedPrompt === prompt ? { background: "var(--gradient-hero)" } : undefined}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Guidance response */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPrompt}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-primary/15 bg-primary/5 border-l-[3px] border-l-primary p-4 space-y-3"
                >
                  <h3 className="font-semibold text-sm text-foreground">{guidance.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{guidance.message}</p>
                  <ol className="space-y-2">
                    {guidance.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 mt-0.5 text-white text-[10px] font-bold" style={{ background: "var(--gradient-hero)" }}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Opportunity cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {twinData.opportunities.map((opp, i) => {
              const { Icon, gradFrom, gradTo, text } = oppConfig[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className={cn("h-9 w-9 rounded-xl bg-gradient-to-br flex items-center justify-center", gradFrom, gradTo)}>
                    <Icon className={cn("h-4 w-4", text)} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{opp.type}</p>
                    <p className="text-sm font-semibold text-foreground leading-snug">{opp.title}</p>
                  </div>
                  <p className={cn("text-xs font-medium", text)}>{opp.projection}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2.5">
                    {opp.nextStep}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Expandable sections */}
          <div className="space-y-3">
            <ExpandableSection
              title={`Core Skills${twinData.coreSkills.length > 0 ? ` · ${twinData.coreSkills.length} detected` : ""}`}
              isOpen={openSections.includes("skills")}
              onToggle={() => toggleSection("skills")}
              accent="success"
            >
              <p className="text-xs text-muted-foreground mb-3">
                Skills your profile already suggests - focus on showing stronger proof.
              </p>
              {twinData.coreSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {twinData.coreSkills.map((skill) => (
                    <span key={skill} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                      <Star className="h-2.5 w-2.5" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Complete your CV analysis to see your core skills.</p>
              )}
            </ExpandableSection>

            <ExpandableSection
              title={`Skills Needing Proof${twinData.skillsNeedingProof.length > 0 ? ` · ${twinData.skillsNeedingProof.length} gaps` : ""}`}
              isOpen={openSections.includes("missing")}
              onToggle={() => toggleSection("missing")}
              accent="warning"
            >
              <p className="text-xs text-muted-foreground mb-3">
                Add examples, results, or projects to prove these stronger.
              </p>
              {twinData.skillsNeedingProof.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {twinData.skillsNeedingProof.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-full text-xs border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  No skill gaps detected - great profile coverage!
                </p>
              )}
            </ExpandableSection>

            <ExpandableSection
              title="Next Steps"
              isOpen={openSections.includes("next")}
              onToggle={() => toggleSection("next")}
              accent="default"
            >
              <ol className="space-y-2.5">
                {twinData.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 mt-0.5 text-white text-[10px] font-bold" style={{ background: "var(--gradient-hero)" }}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </ExpandableSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
