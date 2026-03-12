import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Briefcase, FileText, ArrowRight, Sparkles,
  Brain, MessageSquare, BarChart3, ChevronRight,
  CheckCircle, AlertCircle, Users, GraduationCap,
} from "lucide-react";
import ScoreMeter from "../components/ScoreMeter";
import GlassCard from "../components/GlassCard";
import AIThinkingIndicator from "../components/AIThinkingIndicator";
import LiveInsightsFeed from "../components/LiveInsightsFeed";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import { useUser } from "../lib/user-context";
import { twinAPI, opportunitiesAPI, applicationsAPI } from "../lib/api";

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
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiThinking, setAiThinking] = useState(true);
  const [aiMessage, setAiMessage] = useState("Initialising your AI twin...");
  
  // Reactive completion status
  const [twinCompleted, setTwinCompleted] = useState(false);
  const [cvCompleted, setCvCompleted] = useState(false);
  const [cvData, setCvData] = useState<any | null>(null);
  
  const displayName = user?.name?.split(" ")[0] || "Explorer";

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

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [twinRes, oppRes, appRes] = await Promise.allSettled([
          twinAPI.get(),
          opportunitiesAPI.getAll({ limit: 1 }),
          applicationsAPI.getStats(),
        ]);

        const twin =
          twinRes.status === "fulfilled" ? twinRes.value?.data?.twin : null;
        const opportunitiesMeta =
          oppRes.status === "fulfilled" ? oppRes.value?.meta : null;
        const applicationsStats =
          appRes.status === "fulfilled" ? appRes.value?.data : null;

        const empowermentScore = twin?.empowermentScore || 0;
        const skillsMatched = Array.isArray(user?.skills) ? user.skills.length : 0;
        const opportunitiesCount =
          typeof opportunitiesMeta?.totalFiltered === "number"
            ? opportunitiesMeta.totalFiltered
            : Array.isArray(oppRes.status === "fulfilled" ? oppRes.value?.data?.opportunities : null)
              ? oppRes.value.data.opportunities.length
              : 0;
        const applicationsCount =
          typeof applicationsStats?.total === "number" ? applicationsStats.total : 0;

        let parsedCv = null;
        try {
          const raw = localStorage.getItem("comprehensiveCVAnalysis");
          parsedCv = raw ? JSON.parse(raw) : null;
        } catch {
          parsedCv = null;
        }

        setCvData(parsedCv);
        setTwinCompleted(!!twin);
        setCvCompleted(!!parsedCv);

        setStats({
          empowermentScore,
          cvScore: 0,
          interviewScore: 0,
          skillsMatched,
          opportunitiesCount,
          applicationsCount,
          learnershipsCount: opportunitiesCount,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setStats({
          empowermentScore: 0,
          cvScore: 0,
          interviewScore: 0,
          skillsMatched: 0,
          opportunitiesCount: 0,
          applicationsCount: 0,
          learnershipsCount: 0,
        });
      } finally {
        setLoading(false);
        setAiThinking(false);
        clearInterval(interval);
      }
    };

    const timer = setTimeout(loadDashboard, 1200);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [user?.skills]);

  const quickActions = [
    { icon: FileText, title: "Analyse CV", desc: "Get AI-powered CV insights for the SA market", path: "/dashboard/cv-analyzer", accent: "from-sa-gold/20 to-sa-gold/5", label: "Improve CV" },
    { icon: MessageSquare, title: "Interview Coach", desc: "Practise with SA-specific interview questions", path: "/dashboard/interview-coach", accent: "from-sa-terracotta/20 to-sa-terracotta/5", label: "Practice" },
    { icon: Briefcase, title: "Find Opportunities", desc: "AI-matched jobs, learnerships & graduate programmes", path: "/dashboard/opportunities", accent: "from-sa-green/20 to-sa-green/5", label: "Explore roles" },
    { icon: Brain, title: "Digital Twin", desc: "Build and manage your AI twin profile", path: "/dashboard/twin", accent: "from-primary/20 to-primary/5", label: "Update twin" },
  ];

  const journeySteps = [
    { label: "Build Digital Twin", path: "/dashboard/twin", completed: twinCompleted },
    { label: "Analyse CV", path: "/dashboard/cv-analyzer", completed: cvCompleted },
    { label: "Practice Interview", path: "/dashboard/interview-coach", completed: false },
    { label: "Apply to Opportunities", path: "/dashboard/opportunities", completed: false },
  ];

  // Calculate overall progress percentage
  const completedSteps = journeySteps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / journeySteps.length) * 100);
  const nextStep = journeySteps.find((step) => !step.completed) || journeySteps[journeySteps.length - 1];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 sa-pattern opacity-15" />
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-sa-gold/4 via-transparent to-sa-green/6" />
      <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-sa-gold/10 blur-3xl z-0" />
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sa-green/10 blur-3xl z-0" />
      
      {/* Additional atmospheric effects */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-sa-terracotta/5 blur-3xl z-0" />
      <div className="absolute bottom-1/3 right-1/3 h-48 w-48 rounded-full bg-sa-gold/5 blur-3xl z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">

        <AIThinkingIndicator messages={[aiMessage]} isVisible={aiThinking} />

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassCard glow="cyan" className="relative overflow-hidden">
            {/* Subtle South African flag pattern (hero only) */}
            <div className="absolute inset-0 pointer-events-none opacity-15">
              <svg viewBox="0 0 1200 400" className="h-full w-full">
                <rect width="1200" height="200" fill="rgba(200, 16, 46, 0.9)" />
                <rect y="200" width="1200" height="200" fill="rgba(0, 51, 153, 0.9)" />
                <polygon points="0,0 360,200 0,400" fill="rgba(0, 0, 0, 0.9)" />
                <polygon points="0,40 320,200 0,360" fill="rgba(255, 184, 28, 0.95)" />
                <polygon points="0,80 280,200 0,320" fill="rgba(0, 122, 61, 0.95)" />
                <polygon points="260,200 1200,80 1200,0 200,0" fill="rgba(255, 255, 255, 0.9)" />
                <polygon points="260,200 1200,320 1200,400 200,400" fill="rgba(255, 255, 255, 0.9)" />
                <polygon points="260,200 1200,110 1200,40 220,40" fill="rgba(0, 122, 61, 0.95)" />
                <polygon points="260,200 1200,290 1200,360 220,360" fill="rgba(0, 122, 61, 0.95)" />
              </svg>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sa-gold/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sa-green/20 to-transparent rounded-full blur-3xl -ml-24 -mb-24" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="px-3 py-1 rounded-full bg-sa-gold/10 border border-sa-gold/20 text-sa-gold text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI Command Centre
                  </motion.span>
                  <span className="text-xs text-muted-foreground">Live sync</span>
                </div>

                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-display mb-3 font-bold">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-sa-gold to-sa-terracotta bg-clip-text text-transparent font-bold">{displayName}</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                  Your AI twin is actively analysing the SA career landscape for you.
                </motion.p>

                {!loading && stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Twin Status</p>
                      <p className="text-sm font-semibold">{twinCompleted ? "Active" : "Not built yet"}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Opportunities</p>
                      <p className="text-sm font-semibold">{stats.opportunitiesCount}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Applications</p>
                      <p className="text-sm font-semibold">{stats.applicationsCount || 0}</p>
                    </div>
                  </div>
                )}
              </div>

              {!loading && stats && stats.empowermentScore > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
                  <div className="text-center p-6 bg-sa-gold/15 rounded-2xl border border-sa-gold/30 shadow-lg">
                    <ScoreMeter score={stats.empowermentScore} label="Empowerment" size="lg" />
                    <p className="mt-3 text-sm font-semibold text-foreground">Your current trajectory</p>
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Score Cards */}
        {!loading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { label: "CV Strength", value: stats.cvScore, icon: FileText, hint: "Based on your latest CV analysis", delay: 0.1 },
              { label: "Career Readiness", value: Math.round((stats.cvScore + stats.empowermentScore) / 2), icon: Brain, hint: "Combines CV + empowerment score", delay: 0.2 },
            ].map((card) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: card.delay }}>
                <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-border/50 shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                      <card.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-foreground font-bold">{card.label}</p>
                      <p className="text-sm text-muted-foreground font-medium">{card.hint}</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <ScoreMeter score={card.value} label="Score" size="lg" />
                    {card.value === 0 && (
                      <p className="text-sm text-sa-gold mt-2 flex items-center justify-center md:justify-end gap-1 font-semibold">
                        <AlertCircle className="h-4 w-4" /> No data yet
                      </p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        {!loading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Skills Matched", value: stats.skillsMatched, icon: BarChart3, color: "text-sa-gold" },
              { label: "Opportunities", value: stats.opportunitiesCount, icon: Briefcase, color: "text-sa-green" },
              { label: "Learnerships", value: stats.learnershipsCount || 0, icon: GraduationCap, color: "text-sa-terracotta" },
              { label: "Applications", value: stats.applicationsCount || 0, icon: Target, color: "text-primary" },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}>
                <GlassCard className="group border-2 border-border/50 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">{card.label}</p>
                    <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-105 transition-transform border border-border/30">
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                  <motion.p className={`text-3xl sm:text-4xl font-display ${card.color} font-bold`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    {card.value}
                  </motion.p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">Updated from live data</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <LiveInsightsFeed />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <SkillGapAnalysis cvData={cvData} />
          </motion.div>
        </div>

        {/* Journey + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlassCard>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-display text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-sa-gold" /> Your AI Journey
                    </h3>
                    <p className="text-sm text-muted-foreground">Your next best action is highlighted below.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
                    <p className="text-sm font-semibold text-sa-gold">{progressPercentage}%</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-sa-gold/5 rounded-xl border border-sa-gold/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
                    <span className="text-xs font-bold text-sa-gold">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full bg-gradient-to-r from-sa-gold to-sa-terracotta rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Next step: <span className="text-foreground font-medium">{nextStep.label}</span></p>
                </div>

                <div className="space-y-3">
                  {journeySteps.map((step, i) => {
                    const isNext = nextStep?.label === step.label && !step.completed;
                    // If step is completed, render as non-clickable div
                    if (step.completed) {
                      return (
                        <div
                          key={step.label}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 opacity-75 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-sa-green/20 border border-sa-green/50 text-sa-green flex items-center justify-center text-xs font-display">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium line-through text-muted-foreground">
                              {step.label}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      );
                    }

                    // If step is not completed, render as clickable Link
                    return (
                      <Link
                        key={step.label}
                        to={step.path}
                        className={`flex items-center justify-between p-4 rounded-xl border ${isNext ? "border-sa-gold/50 bg-sa-gold/10" : "border-border/50 bg-muted/20"} hover:border-sa-gold/30 hover:bg-sa-gold/5 transition-all group cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-xs font-display">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{step.label}</span>
                            {isNext && <p className="text-[11px] text-sa-gold">Recommended next action</p>}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-sa-gold transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <GlassCard>
                <h4 className="text-xs font-display uppercase tracking-wide text-muted-foreground mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-sa-gold" /> Profile Snapshot
                </h4>
                <div className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Province</p><p className="text-sm font-medium">{user?.province || "Not set"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Career Goals</p><p className="text-sm font-medium">{user?.interests?.slice(0, 2).join(" / ") || "Not set yet"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Top Skills</p><p className="text-sm font-medium">{user?.skills?.slice(0, 3).join(" / ") || "Add skills in profile"}</p></div>
                </div>
                <Link to="/dashboard/twin" className="mt-4 inline-flex items-center gap-2 text-xs text-sa-gold hover:text-sa-terracotta transition-colors font-medium">
                  Update profile <ArrowRight className="h-3 w-3" />
                </Link>
              </GlassCard>
            </motion.div>

            {quickActions.map((action, i) => (
              <motion.div key={action.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}>
                <Link to={action.path}>
                  <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${action.accent}`} />
                    <div className="relative flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-primary/20 border border-primary/30">
                        <action.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-foreground">{action.title}</h4>
                        <p className="text-sm text-muted-foreground font-medium">{action.desc}</p>
                      </div>
                      <span className="text-xs uppercase tracking-wider text-sa-gold font-semibold border border-sa-gold/30 rounded-full px-3 py-1.5">
                        {action.label}
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              <GlassCard className="bg-gradient-to-br from-sa-gold/10 to-sa-terracotta/10 border-sa-gold/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-sa-gold rounded-full animate-ping opacity-20" />
                    <Brain className="h-8 w-8 text-sa-gold relative" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm">AI Twin Active</h4>
                    <p className="text-xs text-muted-foreground">Scanning for new opportunities...</p>
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
