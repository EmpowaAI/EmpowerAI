import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Bot, Briefcase, CheckCircle,
  ChevronRight, Compass, FileText, Send, Sparkles,
  Target, X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useUser } from "../../contexts/user-context";
import { applicationsAPI, statsAPI } from "../../lib/api";
import { getStoredCvAnalysis } from "../../lib/sensitiveStorage";

// ── Types ──────────────────────────────────────────────────────────────

interface DashboardStats {
  empowermentScore: number;
  cvScore: number;
  skillsMatched: number;
  opportunitiesCount: number;
  applicationsCount: number;
}

// ── Static data ────────────────────────────────────────────────────────

const onboardingSteps = [
  {
    number: "01",
    icon: FileText,
    title: "Upload CV",
    text: "Analyze your CV so EmpowerAI understands your skills and experience.",
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

const journeySteps = [
  {
    title: "Analyze CV",
    description: "Upload your CV and discover your strengths.",
    status: "Start here",
    to: "/dashboard/cv-analyzer",
    icon: FileText,
    completedKey: "cvCompleted",
  },
  {
    title: "Build Twin",
    description: "Create your personal AI career twin.",
    status: "Next",
    to: "/dashboard/twin",
    icon: Bot,
    completedKey: "twinCompleted",
  },
  {
    title: "Choose Path",
    description: "Explore roles, skills, and career options.",
    status: "Recommended",
    to: "/dashboard/opportunities",
    icon: Compass,
    completedKey: null,
  },
  {
    title: "Apply",
    description: "Use your insights to take action.",
    status: "Coming soon",
    to: "/dashboard/opportunities",
    icon: Send,
    completedKey: null,
  },
];

// ── Component ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, progress } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
    try { return localStorage.getItem("empowerai:guideHidden") !== "true"; } catch { return true; }
  });

  const displayName = user?.name?.split(" ")[0] || "Explorer";
  const cvCompleted = progress.cvCompleted;
  const twinCompleted = progress.twinCompleted;

  const dismissGuide = () => {
    setShowWelcomeGuide(false);
    try { localStorage.setItem("empowerai:guideHidden", "true"); } catch { /* ignore */ }
  };

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [statsRes, appsRes] = await Promise.allSettled([
        statsAPI.getDashboardStats(),
        applicationsAPI.getStats(),
      ]);

      const liveStats = statsRes.status === "fulfilled" ? statsRes.value?.data : null;
      const appStats = appsRes.status === "fulfilled" ? appsRes.value?.data : null;

      if (liveStats) {
        setStats({
          empowermentScore: Number(liveStats.empowermentScore) || 0,
          cvScore: Number(liveStats.cvScore) || 0,
          skillsMatched: Number(liveStats.skillsMatched) || 0,
          opportunitiesCount: Number(liveStats.opportunitiesCount || (liveStats as any).totalOpportunities) || 0,
          applicationsCount: Number(appStats?.total) || 0,
        });
      } else {
        // Fall back to localStorage
        let cvScore = 0;
        let empowermentScore = 0;
        let skillsMatched = 0;
        try {
          const analysis = getStoredCvAnalysis<any>();
          if (analysis?.score) cvScore = Number(analysis.score) || 0;
          const rawSkills = localStorage.getItem("cvSkills");
          const parsedSkills = rawSkills ? JSON.parse(rawSkills) : [];
          if (Array.isArray(parsedSkills)) {
            skillsMatched = parsedSkills.length;
            setProfileSkills(parsedSkills.slice(0, 5));
          }
        } catch { /* ignore */ }
        try {
          const twinData = localStorage.getItem("twinData");
          if (twinData) {
            const parsed = JSON.parse(twinData);
            empowermentScore = Number(parsed?.economy?.employabilityScore || parsed?.empowermentScore) || 0;
          }
        } catch { /* ignore */ }
        setStats({ empowermentScore, cvScore, skillsMatched, opportunitiesCount: 0, applicationsCount: 0 });
      }
    } catch {
      setStats({ empowermentScore: 0, cvScore: 0, skillsMatched: 0, opportunitiesCount: 0, applicationsCount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
    // Also read skills from localStorage
    try {
      const raw = localStorage.getItem("cvSkills");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setProfileSkills(parsed.slice(0, 5));
    } catch { /* ignore */ }
  }, [loadDashboard]);

  const quietStats = [
    {
      label: "CV Strength",
      value: loading ? "—" : stats ? `${stats.cvScore}%` : "—",
      helper: cvCompleted ? "Based on your CV analysis" : "Upload CV to get started",
      icon: FileText,
    },
    {
      label: "Twin Readiness",
      value: loading ? "—" : stats ? `${stats.empowermentScore}%` : "—",
      helper: twinCompleted ? "Your AI twin is active" : "Build your twin to activate",
      icon: Bot,
    },
    {
      label: "Live Opportunities",
      value: loading ? "—" : stats ? String(stats.opportunitiesCount) : "—",
      helper: "South Africa focused",
      icon: Briefcase,
    },
    {
      label: "Skills Matched",
      value: loading ? "—" : stats ? String(stats.skillsMatched) : "—",
      helper: "From your CV analysis",
      icon: BarChart3,
    },
  ];

  // Which journey step to highlight as "next"
  const nextStep = cvCompleted
    ? twinCompleted
      ? journeySteps[2]
      : journeySteps[1]
    : journeySteps[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">

        {/* Welcome greeting */}
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome back, <span className="text-primary">{displayName}</span>
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Your AI career journey continues here.
          </p>
        </div>

        {/* ── Dismissible welcome guide ──────────────────────────────── */}
        {showWelcomeGuide && (
          <Card className="relative overflow-hidden border-primary/20">
            <button
              onClick={dismissGuide}
              className="absolute right-4 top-4 z-10 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Close welcome guide"
            >
              <X className="h-4 w-4" />
            </button>

            <CardHeader className="pb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome to EmpowerAI</p>
              <CardTitle className="text-xl">Your career journey starts here</CardTitle>
              <CardDescription>
                Follow these three steps to turn your CV into a clear, personalised career path.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {onboardingSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <Link
                      key={step.number}
                      to={step.to}
                      className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-4 hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-primary/60">{step.number}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="font-semibold text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                    </Link>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
                <span className="font-medium text-foreground">Pro tip:</span>{" "}
                Start with your CV. The stronger your CV data, the better your Twin and career recommendations.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Quiet stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quietStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.helper}</p>
              </Card>
            );
          })}
        </div>

        {/* ── Main two-column layout ─────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

          {/* Left: Journey + recommended action */}
          <div className="space-y-4">

            {/* Recommended next step banner */}
            <Link to={nextStep.to}>
              <Card className="group cursor-pointer border-primary/30 hover:border-primary/60 transition-all bg-primary/5">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-primary font-semibold">Recommended next step</p>
                      <p className="font-bold">{nextStep.title}</p>
                      <p className="text-sm text-muted-foreground">{nextStep.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </CardContent>
              </Card>
            </Link>

            {/* Career journey */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your AI Career Journey
                </CardTitle>
                <CardDescription>Complete each step to unlock better recommendations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {journeySteps.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = step.completedKey === "cvCompleted"
                    ? cvCompleted
                    : step.completedKey === "twinCompleted"
                    ? twinCompleted
                    : false;
                  const isNext = step.title === nextStep.title && !isCompleted;

                  return (
                    <Link
                      key={step.title}
                      to={step.to}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 transition-all group",
                        isCompleted
                          ? "border-green-500/30 bg-green-500/5 opacity-70"
                          : isNext
                          ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                          : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                          isCompleted
                            ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
                            : isNext
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/40 bg-muted/50 text-muted-foreground"
                        )}>
                          {isCompleted
                            ? <CheckCircle className="h-4 w-4" />
                            : <Icon className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <p className={cn("text-sm font-semibold", isCompleted && "line-through text-muted-foreground")}>
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isNext && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {step.status}
                          </span>
                        )}
                        {!isCompleted && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right: Twin snapshot + profile + quick actions */}
          <div className="space-y-4">

            {/* AI Twin snapshot */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-primary" /> Economic Twin
                </CardTitle>
                <CardDescription className="text-xs">Your AI career model</CardDescription>
              </CardHeader>
              <CardContent>
                {twinCompleted && stats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Twin readiness</span>
                      <span className="font-semibold text-primary">{stats.empowermentScore}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${stats.empowermentScore}%` }}
                      />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {[
                        { label: "CV Score", value: `${stats.cvScore}%` },
                        { label: "Skills", value: profileSkills.length > 0 ? `${profileSkills.length} detected` : "None yet" },
                        { label: "Opportunities", value: String(stats.opportunitiesCount) },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between gap-2 border-b border-border/30 pb-1.5 text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-1 w-full">
                      <Link to="/dashboard/twin">
                        Update Twin <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="py-2 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                      <Bot className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">AI Twin ready when you are</p>
                    <p className="mt-1 mb-4 text-xs text-muted-foreground">
                      Start with your CV to activate better insights.
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link to={cvCompleted ? "/dashboard/twin" : "/dashboard/cv-analyzer"}>
                        {cvCompleted ? "Build my Twin" : "Analyse CV first"}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile snapshot */}
            {profileSkills.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Profile Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{user?.province || user?.location || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Top skills</p>
                    <p className="text-sm font-medium">{profileSkills.slice(0, 3).join(" · ") || "No skills detected yet"}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="mt-1 w-full">
                    <Link to="/dashboard/twin">
                      Update profile <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: FileText, title: "Analyse CV", to: "/dashboard/cv-analyzer" },
                  { icon: Bot, title: "Twin Builder", to: "/dashboard/twin" },
                  { icon: Briefcase, title: "Opportunities", to: "/dashboard/opportunities" },
                  { icon: Compass, title: "Interview Coach", to: "/dashboard/interview-coach" },
                ].map(action => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      to={action.to}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-2.5 text-sm hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{action.title}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
