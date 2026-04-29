// frontend/src/pages/Dashboard/Dashboard.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Briefcase, FileText, ArrowRight, Sparkles,
  Brain, MessageSquare, BarChart3, ChevronRight,
  CheckCircle, AlertCircle, Users, GraduationCap,
  X, Bot, Compass, RefreshCcw,
} from "lucide-react";
import ScoreMeter from "../../components/ui/ScoreMeter";
import GlassCard from "../../components/shared/GlassCard";
import AIThinkingIndicator from "../../components/AIThinkingIndicator";
import LiveInsightsFeed from "../../components/LiveInsightsFeed";
import SAJobPlatforms from "../../components/SAJobPlatforms";
import { useUser } from "../../contexts/user-context";
import { applicationsAPI, statsAPI } from "../../lib/api";
import { getStoredCvAnalysis } from "../../lib/sensitiveStorage";
import { cn } from "../../lib/utils";

interface DashboardStats {
  empowermentScore: number;
  cvScore: number;
  interviewScore: number;
  skillsMatched: number;
  opportunitiesCount: number;
  applicationsCount?: number;
  learnershipsCount?: number;
}

interface ProfileData {
  name: string;
  location: string;
  careerGoals: string[];
  topSkills: string[];
  industry?: string;
}

const onboardingSteps = [
  {
    number: "01",
    icon: FileText,
    title: "Upload CV",
    text: "Start by analyzing your CV so EmpowerAI understands your skills and experience.",
    to: "/dashboard/cv-analyzer",
  },
  {
    number: "02",
    icon: Bot,
    title: "Create Twin",
    text: "Build your AI Twin using your CV, goals, and career signals.",
    to: "/dashboard/twin",
  },
  {
    number: "03",
    icon: Compass,
    title: "Explore Path",
    text: "Get suggested careers, skills, opportunities, and next steps.",
    to: "/dashboard/opportunities",
  },
];

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiThinking, setAiThinking] = useState(true);
  const [aiMessage, setAiMessage] = useState("Initialising your AI twin...");
  const [dataSource, setDataSource] = useState<"live" | "cached">("cached");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    location: "",
    careerGoals: [],
    topSkills: [],
  });

  const [twinCompleted, setTwinCompleted] = useState(false);
  const [cvCompleted, setCvCompleted] = useState(false);

  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
    try { return localStorage.getItem("empowerai:guideHidden") !== "true"; } catch { return true; }
  });

  const dismissGuide = () => {
    setShowWelcomeGuide(false);
    try { localStorage.setItem("empowerai:guideHidden", "true"); } catch { /* ignore */ }
  };

  const displayName = user?.name?.split(" ")[0] || profileData.name || "Explorer";

  const formatLastUpdated = (dt: Date | null) => {
    if (!dt) return "Not updated yet";
    const diffMs = Date.now() - dt.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 15) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  };

  // Extracted so the refresh button can call it directly
  const loadDashboard = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      const silent = opts?.silent === true;
      if (silent) setIsRefreshing(true);
      else setLoading(true);
      setAiThinking(true);

      const [statsRes, appsRes] = await Promise.allSettled([
        statsAPI.getDashboardStats(),
        applicationsAPI.getStats(),
      ]);

      const liveStats = statsRes.status === "fulfilled" ? statsRes.value?.data : null;
      const appStats = appsRes.status === "fulfilled" ? appsRes.value?.data : null;

      if (liveStats) {
        setDataSource("live");

        if (Number(liveStats.cvScore) > 0 || !!getStoredCvAnalysis()) setCvCompleted(true);
        if (Number(liveStats.empowermentScore) > 0) setTwinCompleted(true);

        setStats({
          empowermentScore: Number(liveStats.empowermentScore) || 0,
          cvScore: Number(liveStats.cvScore) || 0,
          interviewScore: Number((liveStats as any).interviewScore) || 0,
          skillsMatched: Number(liveStats.skillsMatched) || 0,
          opportunitiesCount: Number(liveStats.opportunitiesCount || (liveStats as any).totalOpportunities) || 0,
          applicationsCount: Number(appStats?.total) || 0,
          learnershipsCount: undefined,
        });
        setLastUpdatedAt(new Date());
      } else {
        setDataSource("cached");
        let cvScore = 0;
        let empowermentScore = 0;
        let skillsMatched = 0;
        try {
          const analysis = getStoredCvAnalysis<any>();
          if (analysis?.score) cvScore = Number(analysis.score) || 0;
          const rawSkills = localStorage.getItem("cvSkills");
          const parsedSkills = rawSkills ? JSON.parse(rawSkills) : [];
          skillsMatched = Array.isArray(parsedSkills) ? parsedSkills.length : 0;
        } catch { /* ignore */ }
        try {
          const twinData = localStorage.getItem("twinData");
          if (twinData) {
            const parsed = JSON.parse(twinData);
            empowermentScore = Number(parsed?.empowermentScore) || 0;
          }
        } catch { /* ignore */ }

        if (cvScore > 0) setCvCompleted(true);
        if (empowermentScore > 0) setTwinCompleted(true);

        setStats({
          empowermentScore,
          cvScore,
          interviewScore: 0,
          skillsMatched,
          opportunitiesCount: 0,
          applicationsCount: 0,
          learnershipsCount: undefined,
        });
        setLastUpdatedAt(new Date());
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setDataSource("cached");
      setStats({
        empowermentScore: 0,
        cvScore: 0,
        interviewScore: 0,
        skillsMatched: 0,
        opportunitiesCount: 0,
        applicationsCount: 0,
        learnershipsCount: 0,
      });
      setLastUpdatedAt(new Date());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setAiThinking(false);
    }
  }, []);

  useEffect(() => {
    const messages = [
      "Scanning SA career landscape...",
      "Analysing skill market demand by province...",
      "Calculating opportunity matches...",
      "Generating personalised insights...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setAiMessage(messages[i % messages.length]);
      i++;
    }, 1500);

    void loadDashboard();

    return () => { clearInterval(interval); };
  }, [loadDashboard]);

  useEffect(() => {
    const checkCompletionStatus = () => {
      setTwinCompleted(false);
      setCvCompleted(false);
      try {
        let topSkills: string[] = [];
        const raw = localStorage.getItem("cvSkills");
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) topSkills = parsed.slice(0, 5);

        const baseName = user?.name || "Career Seeker";
        const baseLocation = user?.province || user?.location || "South Africa";
        const twinDataRaw = localStorage.getItem("twinData");

        if (twinDataRaw) {
          const parsedTwin = JSON.parse(twinDataRaw);
          setProfileData({
            name: parsedTwin.name || baseName,
            location: parsedTwin.province || baseLocation,
            careerGoals: parsedTwin.goals ? [parsedTwin.goals] : ["Professional Growth"],
            topSkills: Array.isArray(parsedTwin.skills) ? parsedTwin.skills.slice(0, 5) : topSkills,
          });
        } else {
          setProfileData({
            name: baseName,
            location: baseLocation,
            careerGoals: ["Professional Growth"],
            topSkills,
          });
        }
      } catch { /* ignore */ }
    };

    checkCompletionStatus();
    window.addEventListener("storage", checkCompletionStatus);
    window.addEventListener("twinCompleted", checkCompletionStatus);
    window.addEventListener("cvCompleted", checkCompletionStatus);
    return () => {
      window.removeEventListener("storage", checkCompletionStatus);
      window.removeEventListener("twinCompleted", checkCompletionStatus);
      window.removeEventListener("cvCompleted", checkCompletionStatus);
    };
  }, [user]);

  const quickActions = [
    { icon: FileText, title: "Analyse CV", desc: "Get AI-powered CV insights for the SA market", path: "/dashboard/cv-analyzer", accent: "from-amber-500/20 to-amber-500/5", label: "Improve CV" },
    { icon: MessageSquare, title: "Interview Coach", desc: "Practise with SA-specific interview questions", path: "/dashboard/interview-coach", accent: "from-orange-500/20 to-orange-500/5", label: "Practice" },
    { icon: Briefcase, title: "Find Opportunities", desc: "AI-matched jobs, learnerships & graduate programmes", path: "/dashboard/opportunities", accent: "from-green-500/20 to-green-500/5", label: "Explore roles" },
    { icon: Brain, title: "Digital Twin", desc: "Build and manage your AI twin profile", path: "/dashboard/twin", accent: "from-primary/20 to-primary/5", label: "Update twin" },
  ];

  const journeySteps = [
    { label: "Analyse CV", icon: FileText, path: "/dashboard/cv-analyzer", completed: cvCompleted },
    { label: "Build Digital Twin", icon: Bot, path: "/dashboard/twin", completed: twinCompleted },
    { label: "Practice Interview", icon: MessageSquare, path: "/dashboard/interview-coach", completed: false },
    { label: "Apply to Opportunities", icon: Briefcase, path: "/dashboard/opportunities", completed: false },
  ];

  const completedSteps = journeySteps.filter(s => s.completed).length;
  const progressPercentage = Math.round((completedSteps / journeySteps.length) * 100);
  const nextStep = journeySteps.find(s => !s.completed) ?? journeySteps[journeySteps.length - 1];

  const quietStats = [
    {
      label: "CV Strength",
      value: stats ? `${stats.cvScore}%` : "—",
      helper: stats && stats.cvScore > 0 ? "Based on your CV analysis" : "Upload your CV to get started",
      icon: FileText,
      color: "text-amber-500",
    },
    {
      label: "Twin Readiness",
      value: stats ? `${stats.empowermentScore}%` : "—",
      helper: stats && stats.empowermentScore > 0 ? "Your AI twin is active" : "Build your twin to activate",
      icon: Bot,
      color: "text-primary",
    },
    {
      label: "Opportunities",
      value: stats ? String(stats.opportunitiesCount) : "—",
      helper: "South Africa focused",
      icon: Briefcase,
      color: "text-green-500",
    },
    {
      label: "Skills Matched",
      value: stats ? String(stats.skillsMatched) : "—",
      helper: "From your CV analysis",
      icon: BarChart3,
      color: "text-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 sa-pattern opacity-15" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary/4 via-transparent to-success/6" />
      <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl z-0" />
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-success/10 blur-3xl z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">

        <AIThinkingIndicator messages={[aiMessage]} isVisible={aiThinking} />

        {/* ── Welcome Guide (dismissible) ─────────────────────────────── */}
        {showWelcomeGuide && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <GlassCard className="relative overflow-hidden border-primary/20">
              <button
                onClick={dismissGuide}
                className="absolute right-4 top-4 z-10 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Close welcome guide"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome to EmpowerAI</p>
                <h2 className="text-xl font-bold mt-1">Your career journey starts here</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Follow these three steps to turn your CV into a clear, personalised career path.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {onboardingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Link key={step.number} to={step.to} className="group flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-primary/60">{step.number}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="font-semibold text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                      {index < onboardingSteps.length - 1 && (
                        <ChevronRight className="hidden sm:block h-4 w-4 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2" />
                      )}
                    </Link>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
                <span className="font-medium text-foreground">Pro tip:</span> Start with your CV. The stronger your CV data, the better your Twin and career recommendations become.
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI Command Centre
                  </span>
                  <span className="text-xs text-muted-foreground">{dataSource === "live" ? "Live data" : "Cached data"}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">Updated {formatLastUpdated(lastUpdatedAt)}</span>
                  <button
                    type="button"
                    onClick={() => void loadDashboard({ silent: true })}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
                    aria-label="Refresh dashboard"
                  >
                    <RefreshCcw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                    Refresh
                  </button>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold">
                  <span className="text-primary">Welcome back, </span>
                  <span className="text-secondary">{displayName}</span>
                </h1>
                <p className="text-base text-muted-foreground">
                  Your AI twin is actively analysing the SA career landscape for you.
                </p>

                {loading && !stats ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(k => (
                      <div key={k} className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 animate-pulse">
                        <div className="h-3 w-20 bg-muted/50 rounded" />
                        <div className="h-4 w-12 bg-muted/50 rounded mt-2" />
                      </div>
                    ))}
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Twin Status", value: twinCompleted ? "Active" : "Not built yet" },
                      { label: "Opportunities", value: String(stats.opportunitiesCount) },
                      { label: "Applications", value: String(stats.applicationsCount || 0) },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {!loading && stats && stats.empowermentScore > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                  <div className="text-center p-6 bg-secondary/15 rounded-2xl border border-secondary/30 shadow-lg">
                    <ScoreMeter score={stats.empowermentScore} label="Empowerment" size="lg" />
                    <p className="mt-3 text-sm font-semibold">Your current trajectory</p>
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Quiet Stats Row ──────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0,1,2,3].map(k => (
              <div key={k} className="rounded-xl border border-border/60 bg-card/40 p-4 animate-pulse">
                <div className="h-3 w-24 bg-muted/50 rounded" />
                <div className="h-6 w-16 bg-muted/50 rounded mt-3" />
                <div className="h-3 w-32 bg-muted/50 rounded mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quietStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.helper}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Recommended next step ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link to={nextStep.path}>
            <GlassCard className="group cursor-pointer hover:scale-[1.01] transition-all border-secondary/25 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/12 via-transparent to-success/10 opacity-70" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-secondary font-semibold">Recommended next step</p>
                    <p className="text-lg font-bold">{nextStep.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {nextStep.label.includes("CV") ? "Unlock better matching and a stronger profile in minutes."
                        : nextStep.label.includes("Twin") ? "Personalise your insights and projections."
                        : nextStep.label.includes("Interview") ? "Practice and improve your readiness score."
                        : "Start applying to real opportunities."}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-secondary shrink-0">
                  Get started <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        {/* ── Score Cards ──────────────────────────────────────────────── */}
        {!loading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { label: "CV Strength", value: stats.cvScore, icon: FileText, hint: "Based on your latest CV analysis", delay: 0.1 },
              { label: "Career Readiness", value: Math.round((stats.cvScore + stats.empowermentScore) / 2), icon: Brain, hint: "Combines CV + empowerment score", delay: 0.2 },
            ].map(card => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: card.delay }}>
                <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-ai-gradient flex items-center justify-center border-none shadow-glow">
                      <card.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide font-bold">{card.label}</p>
                      <p className="text-sm text-muted-foreground">{card.hint}</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <ScoreMeter score={card.value} label="Score" size="lg" />
                    {card.value === 0 && (
                      <p className="text-sm text-secondary mt-2 flex items-center gap-1 font-semibold">
                        <AlertCircle className="h-4 w-4" /> No data yet
                      </p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Main content: Journey + Insights ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Journey steps — 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-secondary" /> Your AI Journey
                    </h3>
                    <p className="text-sm text-muted-foreground">Complete each step to unlock better recommendations.</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
                    <p className="text-sm font-semibold text-secondary">{progressPercentage}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5 rounded-lg bg-secondary/5 border border-secondary/15 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Overall progress</span>
                    <span className="text-xs font-bold text-secondary">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ delay: 0.6, duration: 1 }}
                      className="h-full bg-ai-gradient rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Next: <span className="text-foreground font-medium">{nextStep.label}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  {journeySteps.map((step, i) => {
                    const Icon = step.icon;
                    const isNext = nextStep.label === step.label && !step.completed;
                    if (step.completed) {
                      return (
                        <div key={step.label} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20 opacity-60">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-sm font-medium line-through text-muted-foreground">{step.label}</span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={step.label}
                        to={step.path}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all group",
                          isNext ? "border-secondary/50 bg-secondary/8 hover:bg-secondary/12" : "border-border/50 bg-muted/10 hover:border-secondary/30 hover:bg-secondary/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border",
                            isNext ? "bg-secondary/15 border-secondary/40 text-secondary" : "bg-muted/50 border-border/40 text-muted-foreground"
                          )}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{step.label}</span>
                            </div>
                            {isNext && <p className="text-[11px] text-secondary mt-0.5">Recommended next action</p>}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <LiveInsightsFeed />
            </motion.div>
          </div>

          {/* Right column — 1/3 width */}
          <div className="space-y-4">

            {/* AI Twin snapshot */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <GlassCard>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Economic Twin</h4>
                    <p className="text-xs text-muted-foreground">Your AI career model</p>
                  </div>
                </div>

                {twinCompleted ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Twin readiness</span>
                      <span className="font-semibold text-primary">{stats?.empowermentScore ?? 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats?.empowermentScore ?? 0}%` }} />
                    </div>
                    <div className="space-y-2 pt-1">
                      {[
                        { label: "Location", value: profileData.location || "Not set" },
                        { label: "Skills", value: profileData.topSkills.length > 0 ? `${profileData.topSkills.length} detected` : "None yet" },
                        { label: "Goals", value: profileData.careerGoals[0] || "Not set" },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between gap-2 text-xs border-b border-border/30 pb-1.5">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium text-right">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/dashboard/twin" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                      Update Twin <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                      <Bot className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">AI Twin ready when you are</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Start with your CV to activate better insights.</p>
                    <Link to={cvCompleted ? "/dashboard/twin" : "/dashboard/cv-analyzer"}>
                      <button className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                        {cvCompleted ? "Build my Twin" : "Analyse CV first"}
                      </button>
                    </Link>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Profile snapshot */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <GlassCard>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" /> Profile Snapshot
                </h4>
                <div className="space-y-2.5">
                  {[
                    { label: "Location", value: profileData.location || "Not set" },
                    { label: "Top skills", value: profileData.topSkills.length > 0 ? profileData.topSkills.slice(0, 3).join(" · ") : "No skills detected yet" },
                    { label: "Career goal", value: profileData.careerGoals[0] || "Not set" },
                  ].map(row => (
                    <div key={row.label}>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium">{row.value}</p>
                    </div>
                  ))}
                </div>
                <Link to="/dashboard/twin" className="mt-3 inline-flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 transition-colors font-medium">
                  Update profile <ArrowRight className="h-3 w-3" />
                </Link>
              </GlassCard>
            </motion.div>

            {/* Quick actions */}
            {quickActions.slice(0, 2).map((action, i) => (
              <motion.div key={action.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                <Link to={action.path}>
                  <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden">
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br", action.accent)} />
                    <div className="relative flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <SAJobPlatforms />
            </motion.div>
          </div>
        </div>

        {/* ── Remaining quick actions row ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={action.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
              <Link to={action.path}>
                <GlassCard className="group cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden h-full">
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br", action.accent)} />
                  <div className="relative flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 group-hover:scale-105 transition-transform">
                      <action.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                  <div className="relative mt-3 flex justify-end">
                    <span className="text-xs uppercase tracking-wider text-secondary font-semibold border border-secondary/30 rounded-full px-2.5 py-1">
                      {action.label}
                    </span>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
