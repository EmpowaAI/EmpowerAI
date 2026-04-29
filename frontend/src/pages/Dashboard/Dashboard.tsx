import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BarChart3, Bot, Briefcase, CheckCircle,
  ChevronRight, Compass, FileText, Send, Sparkles,
  Target, X, UserRound, BriefcaseBusiness, CircleDollarSign,
  Lightbulb, Zap,
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
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1070px] border-x border-border bg-background lg:grid-cols-[390px_minmax(0,1fr)]">
        {/* Sidebar - Profile and Overview */}
        <aside className="h-screen overflow-y-auto border-b border-border bg-background px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="space-y-3">
            {/* Profile Section */}
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Welcome</p>
                  <h1 className="mt-1 text-lg font-bold leading-tight text-primary">{displayName}</h1>
                  <p className="mt-1 text-sm font-semibold leading-5 text-foreground">Your AI career journey continues here</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted/60 p-3">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                  <p className="font-semibold text-foreground">
                    {twinCompleted ? "Twin Ready" : cvCompleted ? "CV Complete" : "Getting Started"}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <CircleDollarSign className="h-4 w-4 text-secondary" />
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Score</p>
                  <p className="font-semibold text-foreground">{stats?.empowermentScore || 0}%</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm font-semibold text-foreground">
                {twinCompleted ? "Ready for opportunities" : cvCompleted ? "Build your Twin next" : "Start with CV analysis"}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Your Progress</h3>
              <div className="space-y-3">
                {quietStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Journey Steps */}
            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Your Journey</h3>
              <div className="space-y-2">
                {journeySteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.completedKey && progress[step.completedKey as keyof typeof progress];
                  const isNext = index === journeySteps.findIndex(s => !s.completedKey || !progress[s.completedKey as keyof typeof progress]);
                  
                  return (
                    <Link
                      key={step.title}
                      to={step.to}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-3 transition-colors",
                        isCompleted 
                          ? "bg-muted/30 text-muted-foreground" 
                          : isNext 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "bg-muted/10 text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        isCompleted 
                          ? "bg-muted text-muted-foreground" 
                          : isNext 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          isCompleted 
                            ? "text-muted-foreground" 
                            : isNext 
                              ? "text-primary" 
                              : "text-muted-foreground"
                        )}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      {isNext && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {step.status}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-xl border border-primary bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-primary">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                {!cvCompleted && (
                  <Link to="/dashboard/cv-analyzer">
                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze CV
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {cvCompleted && !twinCompleted && (
                  <Link to="/dashboard/twin">
                    <Button className="w-full">
                      <Bot className="mr-2 h-4 w-4" />
                      Build Twin
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {twinCompleted && (
                  <Link to="/dashboard/opportunities">
                    <Button className="w-full">
                      <Compass className="mr-2 h-4 w-4" />
                      Explore Opportunities
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </section>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex h-screen min-h-0 flex-col bg-background">
          <div className="flex-1 overflow-y-auto px-4 pb-8 pt-12 sm:px-5">
            <div className="space-y-6">
              {/* Welcome Guide */}
              {showWelcomeGuide && (
                <div className="rounded-xl border border-primary/20 bg-card p-6 relative">
                  <button
                    onClick={dismissGuide}
                    className="absolute right-4 top-4 z-10 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    aria-label="Close welcome guide"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome to EmpowerAI</p>
                    <h2 className="text-xl font-bold text-primary mt-1">Your career journey starts here</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Follow these three steps to turn your CV into a clear, personalised career path.
                    </p>
                  </div>

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
                </div>
              )}

              {/* Recommended Next Step */}
              <Link to={nextStep.to}>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 cursor-pointer hover:border-primary/60 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-widest text-primary font-semibold">Recommended next step</p>
                      <p className="font-bold text-lg">{nextStep.title}</p>
                      <p className="text-sm text-muted-foreground">{nextStep.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Recent Activity */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-primary mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {profileSkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Skills from your CV</p>
                      <div className="flex flex-wrap gap-2">
                        {profileSkills.slice(0, 8).map((skill, index) => (
                          <span key={index} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                            {skill}
                          </span>
                        ))}
                        {profileSkills.length > 8 && (
                          <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                            +{profileSkills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">AI Twin Status</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {twinCompleted 
                          ? "Your Economic Twin is ready and waiting for your questions." 
                          : cvCompleted 
                            ? "Build your AI Twin to get personalized career insights." 
                            : "Complete CV analysis first to unlock your AI Twin."
                        }
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Compass className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">Opportunities</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.opportunitiesCount || 0} roles matched to your profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
