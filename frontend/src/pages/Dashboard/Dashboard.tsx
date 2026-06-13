import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  Target,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ContactWidget } from "@/components/ContactWidget";
import { getStoredCvAnalysis } from "../../lib/sensitiveStorage";
import { opportunitiesAPI } from "../../lib/api";
import { useUser } from "../../contexts/user-context";

const Dashboard = () => {
  const { user, progress, cvData } = useUser();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "";

  const cvCompleted = progress.cvCompleted;
  const twinCompleted = progress.twinCompleted;
  const empowermentScore = progress.empowermentScore ?? 0;

  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);
  const [cvScore, setCvScore] = useState(0);
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  // CV score + top skills — derive from stored analysis or cvData from context
  useEffect(() => {
    let score = Number(localStorage.getItem("cvScore")) || 0;
    if (!score) score = Number(getStoredCvAnalysis<any>()?.score) || 0;
    if (!score && cvData?.score) score = cvData.score;
    setCvScore(score);

    const fromStorage = (() => {
      try {
        const raw = JSON.parse(localStorage.getItem("cvSkills") || "[]");
        return Array.isArray(raw) ? raw : [];
      } catch {
        return [];
      }
    })();
    const skills = fromStorage.length > 0
      ? fromStorage.slice(0, 5)
      : (cvData?.sections?.skills ?? []).slice(0, 5);
    setTopSkills(skills);
  }, [cvData]);

  // Live opportunity count — single lightweight backend call
  useEffect(() => {
    let cancelled = false;
    opportunitiesAPI.getAll({ limit: 1, page: 1 })
      .then((res: any) => {
        if (cancelled) return;
        const meta = res?.meta ?? res?.data?.meta;
        const count =
          typeof meta?.totalInDatabase === "number" && meta.totalInDatabase > 0
            ? meta.totalInDatabase
            : typeof meta?.totalFiltered === "number" && meta.totalFiltered > 0
            ? meta.totalFiltered
            : null;
        if (count !== null) setLiveCount(count);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Hide welcome guide once CV is done
  useEffect(() => {
    if (cvCompleted) setShowWelcomeGuide(false);
  }, [cvCompleted]);

  const completedCount = [cvCompleted, twinCompleted, false, false].filter(Boolean).length;
  const progressPct = Math.round((completedCount / 4) * 100);

  // Both scores present → average; only one → use that one; neither → 0
  const readinessScore =
    cvScore > 0 && empowermentScore > 0
      ? Math.round((cvScore + empowermentScore) / 2)
      : cvScore > 0
      ? cvScore
      : empowermentScore > 0
      ? empowermentScore
      : 0;

  const quietStats = [
    {
      label: "CV strength",
      value: cvScore > 0 ? `${cvScore}%` : "—",
      note: cvScore > 0 ? "Based on your last upload" : "Analyse your CV first",
    },
    {
      label: "Readiness",
      value: readinessScore > 0 ? `${readinessScore}%` : "—",
      note: readinessScore > 0 ? "Career readiness score" : "Build your twin next",
    },
    {
      label: "Live opportunities",
      value: liveCount !== null ? liveCount.toLocaleString() : "—",
      note: liveCount !== null ? "Active in South Africa" : "Loading…",
    },
  ];

  const onboardingSteps = [
    {
      icon: FileText,
      title: "Upload CV",
      text: "Start with your CV so EmpowaAI can understand your real skills.",
      to: "/dashboard/cv-analyzer",
    },
    {
      icon: Bot,
      title: "Build Digital Twin",
      text: "Turn your experience into a clear career and income profile.",
      to: "/dashboard/twin",
    },
    {
      icon: Compass,
      title: "Explore Opportunities",
      text: "See jobs, study options, funding, and side-income ideas that fit you.",
      to: "/dashboard/opportunities",
    },
  ];

  const primaryActions = [
    {
      icon: ClipboardCheck,
      title: "Analyse CV",
      text: "Find strengths, proof gaps, and your next best move.",
      cta: cvCompleted ? "Re-analyse" : "Improve CV",
      to: "/dashboard/cv-analyzer",
    },
    {
      icon: Bot,
      title: "Digital Twin",
      text: "Build your AI career profile from real evidence.",
      cta: twinCompleted ? "View twin" : "Build twin",
      to: "/dashboard/twin",
    },
    {
      icon: BriefcaseBusiness,
      title: "Find Opportunities",
      text: "Explore jobs, learnerships, funding, and starter ventures.",
      cta: "Explore",
      to: "/dashboard/opportunities",
    },
  ];

  const journeySteps = [
    {
      title: "Analyse your CV",
      status: cvCompleted ? "Done" : "Start here",
      done: cvCompleted,
      active: !cvCompleted,
      to: "/dashboard/cv-analyzer",
    },
    {
      title: "Build your Digital Twin",
      status: twinCompleted ? "Done" : cvCompleted ? "Next" : "After CV",
      done: twinCompleted,
      active: cvCompleted && !twinCompleted,
      to: "/dashboard/twin",
    },
    {
      title: "Practice an Interview",
      status: "Soon",
      done: false,
      active: twinCompleted,
      to: "/dashboard/interview-coach",
    },
    {
      title: "Apply with confidence",
      status: "When ready",
      done: false,
      active: false,
      to: "/dashboard/opportunities",
    },
  ];

  const nextActionTitle = !cvCompleted
    ? "Analyse your CV"
    : !twinCompleted
    ? "Build your Digital Twin"
    : "Explore Opportunities";
  const nextActionDesc = !cvCompleted
    ? "This unlocks stronger guidance and makes every next recommendation more personal."
    : !twinCompleted
    ? "Your CV is analysed — now build your twin to unlock interview coaching and matched opportunities."
    : "Your twin is active. Browse matched jobs, learnerships, and income ideas.";
  const nextActionTo = !cvCompleted
    ? "/dashboard/cv-analyzer"
    : !twinCompleted
    ? "/dashboard/twin"
    : "/dashboard/opportunities";
  const nextActionCta = !cvCompleted ? "Analyse CV" : !twinCompleted ? "Build Twin" : "Find Opportunities";

  return (
    <motion.div
      className="font-sans text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <main>
        <section>
          {/* ── Gradient Hero Banner ── */}
          <div className="relative overflow-hidden rounded-2xl mb-8 text-white" style={{ background: 'var(--gradient-hero)' }}>
            <div className="pointer-events-none absolute inset-0 ai-mesh opacity-15" aria-hidden />
            <div className="pointer-events-none absolute inset-0 ai-grid opacity-10" aria-hidden />
            <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-25" aria-hidden />
            <div className="relative z-10 p-6 md:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm mb-3">
                <Sparkles className="h-3 w-3 text-secondary" />
                {firstName ? `${greeting}, ${firstName}` : greeting}
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Your <span className="text-gradient-ai">Career Hub</span>
              </h1>
              <p className="mt-2 text-white/75 max-w-md text-sm md:text-base">
                Track your progress, build your profile, and take the next step toward your future.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
                {quietStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 md:p-4">
                    <p className="font-display text-2xl md:text-3xl font-bold text-white leading-none">{stat.value}</p>
                    <p className="text-xs text-white/65 mt-1 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
            <div className="space-y-5">

              {/* ── Welcome Guide ── gradient card, only before CV upload ── */}
              {showWelcomeGuide && !cvCompleted && (
                <div className="relative overflow-hidden rounded-2xl text-white" style={{ background: 'var(--gradient-hero)' }}>
                  <div className="pointer-events-none absolute inset-0 ai-mesh opacity-10" aria-hidden />
                  <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 z-10 text-white/60 hover:text-white hover:bg-white/15"
                    aria-label="Close welcome guide"
                    onClick={() => setShowWelcomeGuide(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="relative z-10 p-6 md:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm mb-4">
                      <Sparkles className="h-3 w-3 text-secondary" />
                      Getting started
                    </div>
                    <h1 className="font-display text-2xl font-bold text-white md:text-3xl">
                      Welcome to <span className="text-gradient-ai">EmpowaAI</span>
                    </h1>
                    <p className="mt-1 text-sm text-white/70 md:text-base">Three steps to career clarity.</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {onboardingSteps.map(({ icon: Icon, title, text, to }, i) => (
                        <Link
                          key={title}
                          to={to}
                          className="group rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 hover:bg-white/20 transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white flex-shrink-0">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Step {i + 1}</span>
                          </div>
                          <p className="font-display text-sm font-bold text-white group-hover:text-secondary mb-1">{title}</p>
                          <p className="text-xs leading-5 text-white/65">{text}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Recommended Next Step ── orange-accented card ── */}
              <div className="relative overflow-hidden rounded-2xl border border-secondary/25 bg-gradient-to-r from-secondary/8 to-transparent p-5 md:p-6 shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-2xl" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pl-2">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-white shadow-md">
                      <Target className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">
                        Recommended next step
                      </p>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {nextActionTitle}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{nextActionDesc}</p>
                    </div>
                  </div>
                  <Button asChild variant="cta" size="sm" className="shrink-0 shimmer">
                    <Link to={nextActionTo}>{nextActionCta}</Link>
                  </Button>
                </div>
              </div>

              {/* ── Journey ── premium step indicators ── */}
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">Your AI Journey</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">One step at a time.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-secondary">{progressPct}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {journeySteps.map((step, index) =>
                      step.done ? (
                        <div
                          key={step.title}
                          className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 p-3.5 opacity-60"
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            </span>
                            <span className="text-sm font-medium text-muted-foreground line-through">{step.title}</span>
                          </span>
                          <span className="text-xs font-bold text-secondary flex-shrink-0">{step.status}</span>
                        </div>
                      ) : (
                        <Link
                          key={step.title}
                          to={step.to}
                          className={cn(
                            "flex items-center justify-between gap-4 rounded-xl border p-3.5 transition-all group",
                            step.active
                              ? "border-secondary/40 bg-gradient-to-r from-secondary/8 to-transparent hover:from-secondary/15 shadow-sm"
                              : "border-border/60 bg-background hover:border-primary/25 hover:bg-muted/30"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 transition-colors",
                              step.active ? "bg-secondary text-white shadow-sm" : "bg-muted text-muted-foreground"
                            )}>
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className={cn("text-sm font-semibold", step.active ? "text-foreground" : "text-muted-foreground")}>
                              {step.title}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground flex-shrink-0">
                            {step.status}
                            {step.active && <ArrowRight className="h-3 w-3 text-secondary group-hover:translate-x-0.5 transition-transform" />}
                          </span>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">

              {/* Profile Snapshot — gradient header */}
              <div className="rounded-2xl overflow-hidden border border-border/60 shadow-sm">
                <div className="relative p-4 text-white" style={{ background: 'var(--gradient-hero)' }}>
                  <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white flex-shrink-0">
                      <Compass className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-base font-bold text-white">Profile snapshot</h2>
                      <p className="text-xs text-white/70">South Africa · Professional growth</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Top skills</p>
                    {topSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {topSkills.map((s) => (
                          <span key={s} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        <Link to="/dashboard/cv-analyzer" className="text-secondary hover:underline underline-offset-2 font-semibold">
                          Analyse CV
                        </Link>{" "}to detect skills
                      </p>
                    )}
                  </div>
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Twin status</p>
                    {twinCompleted ? (
                      <p className="text-secondary font-semibold text-xs">
                        Active ·{" "}
                        <Link to="/dashboard/twin" className="hover:underline underline-offset-2">view Digital Twin</Link>
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        <Link to="/dashboard/twin" className="text-secondary hover:underline underline-offset-2 font-semibold">Build twin</Link>{" "}after CV analysis
                      </p>
                    )}
                  </div>
                  {empowermentScore > 0 && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Empowerment score</p>
                      <p className="text-2xl font-bold text-primary">{empowermentScore}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Actions — full-card links with gradient icon */}
              <div className="space-y-2">
                {primaryActions.map(({ icon: Icon, title, text, cta, to }) => (
                  <Link
                    key={title}
                    to={to}
                    className="flex gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-secondary/30 hover:shadow-md transition-all group"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary group-hover:from-secondary/20 group-hover:to-secondary/5 transition-all">
                      <Icon className="h-4.5 w-4.5 group-hover:text-secondary transition-colors" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">{title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-4">{text}</p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                        {cta} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Footer — gradient left-border */}
              <div className="relative overflow-hidden rounded-2xl border border-primary/15">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-l-2xl" />
                <div className="p-4 pl-5 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">AI Twin ready when you are</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {twinCompleted
                          ? "Your twin is live and scanning for opportunities."
                          : "We keep the dashboard quiet until your CV gives us better evidence."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <ContactWidget />
    </motion.div>
  );
};

export default Dashboard;
