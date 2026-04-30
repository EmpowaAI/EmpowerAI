import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Briefcase, FileText, ArrowRight, Sparkles,
  Brain, MessageSquare, BarChart3, ChevronRight,
  CheckCircle, AlertCircle, Users, GraduationCap,
} from "lucide-react";
import ScoreMeter from "../components/interview/ScoreMeter";
import GlassCard from "../components/shared/GlassCard";
import AIThinkingIndicator from "../components/AIThinkingIndicator";
import LiveInsightsFeed from "../components/LiveInsightsFeed";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import { getStoredCvAnalysis } from "../lib/sensitiveStorage";

interface DashboardStats {
  empowermentScore: number;
  cvScore: number;
  interviewScore: number;
  skillsMatched: number;
  opportunitiesCount: number;
  applicationsCount?: number;
  learnershipsCount?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(true);
  const [aiMessage, setAiMessage] = useState("Initialising your AI twin...");

  // Reactive completion status
  const [twinCompleted, setTwinCompleted] = useState(false);
  const [cvCompleted, setCvCompleted] = useState(false);

  // Check localStorage for completion status
  useEffect(() => {
    const checkCompletionStatus = () => {
      try {
        setTwinCompleted(!!localStorage.getItem("twinData"));
        setCvCompleted(localStorage.getItem("cvCompleted") === "true");
      } catch {
        // ignore
      }
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

    const timer = setTimeout(() => {
      // Read CV score from localStorage
      let cvScore = 0;
      try {
        const storedScore = localStorage.getItem("cvScore");
        if (storedScore) cvScore = Number(storedScore) || 0;
        if (!cvScore) cvScore = Number(getStoredCvAnalysis<any>()?.score) || 0;
      } catch {
        // ignore
      }

      // Read empowerment score from twin data — nested as economy.employabilityScore
      let empowermentScore = 0;
      try {
        const rawTwin = localStorage.getItem("twinData");
        if (rawTwin) {
          const parsed = JSON.parse(rawTwin);
          empowermentScore =
            parsed.economy?.employabilityScore ||
            parsed.empowermentScore ||
            parsed.profile?.empowermentScore ||
            0;
        }
      } catch {
        // ignore
      }

      // Derive stats from real data only — no random values
      const skillsRaw = (() => {
        try { return JSON.parse(localStorage.getItem("cvSkills") || "[]"); } catch { return []; }
      })();
      const skillsMatched: number = Array.isArray(skillsRaw) ? skillsRaw.length : 0;

      setStats({
        empowermentScore,
        cvScore,
        interviewScore: 0,
        skillsMatched,
        opportunitiesCount: 0,
        applicationsCount: 0,
        learnershipsCount: 0,
      });
      setLoading(false);
      setAiThinking(false);
      clearInterval(interval);
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Read real profile data from localStorage
  const profileSkills: string[] = (() => {
    try { return JSON.parse(localStorage.getItem("cvSkills") || "[]").slice(0, 3); } catch { return []; }
  })();
  const twinRaw = (() => {
    try { return JSON.parse(localStorage.getItem("twinData") || "null"); } catch { return null; }
  })();
  const profileIndustry: string =
    twinRaw?.identity?.industry || twinRaw?.profile?.industry || twinRaw?.industry || "";
  const profileRole: string =
    twinRaw?.identity?.currentRole || twinRaw?.profile?.name || twinRaw?.name || "";

  const quickActions = [
    {
      icon: FileText,
      title: "Analyse CV",
      desc: "Get AI-powered CV insights for the SA market",
      path: "/dashboard/cv-analyzer",
      color: "secondary",
    },
    {
      icon: MessageSquare,
      title: "Interview Coach",
      desc: "Practise with SA-specific interview questions",
      path: "/dashboard/interview-coach",
      color: "secondary",
    },
    {
      icon: Briefcase,
      title: "Find Opportunities",
      desc: "AI-matched jobs, learnerships & graduate programmes",
      path: "/dashboard/opportunities",
      color: "primary",
    },
    {
      icon: Brain,
      title: "Digital Twin",
      desc: "Build and manage your AI twin profile",
      path: "/dashboard/twin",
      color: "primary",
    },
  ];

  const journeySteps = [
    { label: "Analyse CV", path: "/dashboard/cv-analyzer", completed: cvCompleted },
    { label: "Build Digital Twin", path: "/dashboard/twin", completed: twinCompleted },
    { label: "Practice Interview", path: "/dashboard/interview-coach", completed: false },
    { label: "Apply to Opportunities", path: "/dashboard/opportunities", completed: false },
  ];

  const completedSteps = journeySteps.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedSteps / journeySteps.length) * 100);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="fixed inset-0 -z-10 sa-pattern opacity-20" />
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />

        <AIThinkingIndicator messages={[aiMessage]} isVisible={aiThinking} />

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard glow="cyan" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -ml-24 -mb-24" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI Command Centre
                  </motion.span>
                </div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-display mb-2"
                >
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent font-display">
                    Explorer
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground"
                >
                  {cvCompleted
                    ? "Your AI twin is actively analysing the SA career landscape for you."
                    : "Start by uploading your CV to unlock personalised insights."}
                </motion.p>
              </div>

              {!loading && stats && stats.empowermentScore > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <div className="text-center p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                    <ScoreMeter
                      score={stats.empowermentScore}
                      label="Empowerment"
                      size="md"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Score Cards */}
        {!loading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "CV Strength",
                value: stats.cvScore,
                cta: "/dashboard/cv-analyzer",
                ctaLabel: "Analyse CV",
                delay: 0.1,
              },
              {
                label: "Career Readiness",
                value:
                  stats.cvScore > 0 || stats.empowermentScore > 0
                    ? Math.round((stats.cvScore + stats.empowermentScore) / 2)
                    : 0,
                cta: "/dashboard/twin",
                ctaLabel: "Build twin",
                delay: 0.2,
              },
              {
                label: "Interview Confidence",
                value: stats.interviewScore,
                cta: "/dashboard/interview-coach",
                ctaLabel: "Start coaching",
                delay: 0.3,
              },
            ].map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: card.delay }}
              >
                <GlassCard className="text-center">
                  <ScoreMeter score={card.value} label={card.label} size="md" />
                  {card.value === 0 && (
                    <Link
                      to={card.cta}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline underline-offset-2"
                    >
                      <AlertCircle className="h-3 w-3" /> {card.ctaLabel}
                    </Link>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        {!loading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Skills Matched",
                value: stats.skillsMatched,
                icon: BarChart3,
                color: "text-secondary",
                emptyCta: "/dashboard/cv-analyzer",
              },
              {
                label: "Opportunities",
                value: stats.opportunitiesCount,
                icon: Briefcase,
                color: "text-primary",
                emptyCta: "/dashboard/opportunities",
              },
              {
                label: "Learnerships",
                value: stats.learnershipsCount || 0,
                icon: GraduationCap,
                color: "text-secondary",
                emptyCta: "/dashboard/opportunities",
              },
              {
                label: "Applications",
                value: stats.applicationsCount || 0,
                icon: Target,
                color: "text-primary",
                emptyCta: null,
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i }}
              >
                <GlassCard>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {card.label}
                    </p>
                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                  <motion.p
                    className={`text-3xl font-display ${card.value > 0 ? card.color : "text-muted-foreground"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    {card.value > 0 ? card.value : "—"}
                  </motion.p>
                  {card.value === 0 && card.emptyCta && (
                    <Link
                      to={card.emptyCta}
                      className="mt-1 text-[11px] text-secondary hover:underline underline-offset-2 font-medium"
                    >
                      Get started
                    </Link>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LiveInsightsFeed />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SkillGapAnalysis />
          </motion.div>
        </div>

        {/* Journey + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-secondary" /> Your AI Journey
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete each step to unlock your full potential
                    </p>
                  </div>
                  <Target className="h-6 w-6 text-secondary" />
                </div>

                <div className="mb-6 p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="text-xs font-bold text-secondary">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {journeySteps.map((step, i) =>
                    step.completed ? (
                      <div
                        key={step.label}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 opacity-70"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium line-through text-muted-foreground">
                            {step.label}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    ) : (
                      <Link
                        key={step.label}
                        to={step.path}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:border-secondary/30 hover:bg-secondary/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-xs font-bold">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <span className="text-sm font-medium">{step.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                      </Link>
                    )
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <div className="space-y-4">
            {/* Profile Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <GlassCard>
                <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" /> Profile Snapshot
                </h4>
                {cvCompleted ? (
                  <div className="space-y-3">
                    {profileRole && (
                      <div>
                        <p className="text-xs text-muted-foreground">Current Role</p>
                        <p className="text-sm font-medium">{profileRole}</p>
                      </div>
                    )}
                    {profileIndustry && (
                      <div>
                        <p className="text-xs text-muted-foreground">Industry</p>
                        <p className="text-sm font-medium capitalize">{profileIndustry}</p>
                      </div>
                    )}
                    {profileSkills.length > 0 ? (
                      <div>
                        <p className="text-xs text-muted-foreground">Top Skills</p>
                        <p className="text-sm font-medium">{profileSkills.join(" · ")}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Skills will appear after CV analysis.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Upload your CV to populate your profile snapshot.
                  </p>
                )}
                <Link
                  to="/dashboard/twin"
                  className="mt-4 inline-flex items-center gap-2 text-xs text-secondary hover:text-secondary/80 transition-colors font-medium"
                >
                  {cvCompleted ? "Update profile" : "Build profile"}{" "}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </GlassCard>
            </motion.div>

            {/* Quick Actions */}
            {quickActions.map((action, i) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <Link to={action.path}>
                  <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-primary/10">
                        <action.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-secondary transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}

            {/* AI Active Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <GlassCard className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-20" />
                    <Brain className="h-8 w-8 text-secondary relative" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm">AI Twin Active</h4>
                    <p className="text-xs text-muted-foreground">
                      {twinCompleted
                        ? "Your twin is built and ready to use."
                        : "Build your twin to activate AI insights."}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
