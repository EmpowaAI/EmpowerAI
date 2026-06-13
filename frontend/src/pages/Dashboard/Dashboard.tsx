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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import GlassCard from "@/components/shared/GlassCard";
import PageHeader from "@/components/shared/PageHeader";
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

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <motion.div
      className="min-h-screen bg-background font-sans text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <main className="bg-gradient-to-b from-muted/35 via-background to-background">
        <section className="container py-8 md:py-10">
          <div className="mx-auto max-w-6xl">
            <PageHeader
              eyebrow={firstName ? `${greeting}, ${firstName}` : greeting}
              title="Your Career Hub"
              subtitle="Track your progress, build your profile, and take the next step."
              className="mb-8"
            />
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.45fr_0.85fr]">
            <div className="space-y-6">
              {/* Welcome Guide — hidden once CV is done */}
              {showWelcomeGuide && !cvCompleted && (
                <Card className="relative overflow-hidden border-primary/20 bg-card p-6 shadow-card-soft md:p-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="Close welcome guide"
                    onClick={() => setShowWelcomeGuide(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="pr-10">
                    <h1 className="font-display text-2xl font-bold text-primary md:text-3xl">
                      Welcome to EmpowaAI
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-muted-foreground md:text-base">
                      Three steps to career clarity.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {onboardingSteps.map(({ icon: Icon, title, text, to }) => (
                      <Link
                        key={title}
                        to={to}
                        className="group rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <h3 className="font-display text-base font-bold text-primary group-hover:text-secondary">
                            {title}
                          </h3>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recommended Next Step */}
              <Card className="border-secondary/25 bg-secondary/5 p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                      <Target className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                        Recommended next step
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-primary">
                        {nextActionTitle}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">{nextActionDesc}</p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="shrink-0 border-secondary/40 text-secondary hover:bg-secondary/10"
                  >
                    <Link to={nextActionTo}>{nextActionCta}</Link>
                  </Button>
                </div>
              </Card>

              {/* Stats */}
              <motion.div
                className="grid gap-4 md:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {quietStats.map((stat) => (
                  <motion.div key={stat.label} variants={itemVariants}>
                    <GlassCard className="p-5 hover:shadow-elevated transition-shadow duration-300" animate={false}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-4 font-display text-4xl font-bold text-primary">{stat.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{stat.note}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>

              {/* Journey */}
              <Card className="border-border/70 p-5 shadow-sm md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-primary">Your AI Journey</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Simple, calm, and one action at a time.
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {progressPct}% complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-secondary transition-[width] duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {journeySteps.map((step, index) =>
                    step.done ? (
                      <div
                        key={step.title}
                        className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 opacity-70"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </span>
                          <span className="font-semibold text-muted-foreground line-through">
                            {step.title}
                          </span>
                        </span>
                        <span className="text-right text-xs font-semibold text-secondary">{step.status}</span>
                      </div>
                    ) : (
                      <Link
                        key={step.title}
                        to={step.to}
                        className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                          step.active
                            ? "border-secondary/35 bg-secondary/5 hover:bg-secondary/10"
                            : "border-border/70 bg-background hover:border-primary/30"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-semibold text-foreground">{step.title}</span>
                        </span>
                        <span className="flex items-center gap-1 text-right text-xs font-semibold text-muted-foreground">
                          {step.status}
                          {step.active && <ArrowRight className="h-3 w-3 text-secondary" />}
                        </span>
                      </Link>
                    )
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              {/* Profile Snapshot */}
              <Card className="border-border/70 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Compass className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-primary">Profile snapshot</h2>
                    <p className="text-xs text-muted-foreground">South Africa · Professional growth</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">Top skills</p>
                    {topSkills.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {topSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-1">
                        <Link to="/dashboard/cv-analyzer" className="text-secondary hover:underline underline-offset-2">
                          Analyse CV
                        </Link>{" "}
                        to detect skills
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Twin status</p>
                    {twinCompleted ? (
                      <p className="mt-1 text-secondary font-semibold text-xs">
                        Active · view in{" "}
                        <Link to="/dashboard/twin" className="hover:underline underline-offset-2">
                          Digital Twin
                        </Link>
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-1">
                        <Link to="/dashboard/twin" className="text-secondary hover:underline underline-offset-2">
                          Build twin
                        </Link>{" "}
                        after CV analysis
                      </p>
                    )}
                  </div>
                  {empowermentScore > 0 && (
                    <div>
                      <p className="font-semibold text-foreground">Empowerment score</p>
                      <p className="mt-1 text-2xl font-bold text-primary">{empowermentScore}%</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Primary Actions */}
              <div className="space-y-3">
                {primaryActions.map(({ icon: Icon, title, text, cta, to }) => (
                  <Card
                    key={title}
                    className="border-border/70 p-5 shadow-sm transition-colors hover:border-primary/30"
                  >
                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p>
                        <Button asChild variant="link" className="mt-2 h-auto p-0 text-secondary">
                          <Link to={to}>{cta}</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Footer Card */}
              <Card className="border-primary/20 bg-primary/5 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-semibold text-primary">AI Twin ready when you are</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {twinCompleted
                        ? "Your twin is live and scanning for opportunities."
                        : "We keep the dashboard quiet until your CV gives us better evidence."}
                    </p>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </section>
      </main>

      <ContactWidget />
    </motion.div>
  );
};

export default Dashboard;
