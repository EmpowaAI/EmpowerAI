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

        setTwinCompleted(!!twin);
        setCvCompleted(false);

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
    { icon: FileText, title: "Analyse CV", desc: "Get AI-powered CV insights for the SA market", path: "/dashboard/cv-analyzer", color: "sa-gold" },
    { icon: MessageSquare, title: "Interview Coach", desc: "Practise with SA-specific interview questions", path: "/dashboard/interview-coach", color: "sa-terracotta" },
    { icon: Briefcase, title: "Find Opportunities", desc: "AI-matched jobs, learnerships & graduate programmes", path: "/dashboard/opportunities", color: "sa-green" },
    { icon: Brain, title: "Digital Twin", desc: "Build and manage your AI twin profile", path: "/dashboard/twin", color: "primary" },
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 sa-pattern opacity-20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sa-gold/5 via-transparent to-sa-green/10" />
      <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-sa-gold/10 blur-3xl -z-10" />
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sa-green/10 blur-3xl -z-10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">

        <AIThinkingIndicator messages={[aiMessage]} isVisible={aiThinking} />

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassCard glow="cyan" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sa-gold/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sa-green/20 to-transparent rounded-full blur-3xl -ml-24 -mb-24" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="px-3 py-1 rounded-full bg-sa-gold/10 border border-sa-gold/20 text-sa-gold text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI Command Centre
                  </motion.span>
                </div>
                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl md:text-4xl font-display mb-2">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-sa-gold to-sa-terracotta bg-clip-text text-transparent">{displayName}</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-muted-foreground">
                  Your AI twin is actively analysing the SA career landscape for you.
                </motion.p>
              </div>

              {!loading && stats && stats.empowermentScore > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
                  <div className="text-center p-4 bg-sa-gold/10 rounded-xl border border-sa-gold/20">
                    <ScoreMeter score={stats.empowermentScore} label="Empowerment" size="md" />
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Score Cards */}
        {!loading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "CV Strength", value: stats.cvScore, delay: 0.1 },
              { label: "Career Readiness", value: Math.round((stats.cvScore + stats.empowermentScore) / 2), delay: 0.2 },
            ].map((card) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: card.delay }}>
                <GlassCard className="text-center">
                  <ScoreMeter score={card.value} label={card.label} size="md" />
                  {card.value === 0 && (
                    <p className="text-xs text-sa-gold mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Not started
                    </p>
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
              { label: "Skills Matched", value: stats.skillsMatched, icon: BarChart3, color: "text-sa-gold" },
              { label: "Opportunities", value: stats.opportunitiesCount, icon: Briefcase, color: "text-sa-green" },
              { label: "Learnerships", value: stats.learnershipsCount || 0, icon: GraduationCap, color: "text-sa-terracotta" },
              { label: "Applications", value: stats.applicationsCount || 0, icon: Target, color: "text-primary" },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}>
                <GlassCard>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                    <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center">
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                  <motion.p className={`text-3xl font-display ${card.color}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    {card.value}
                  </motion.p>
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
            <SkillGapAnalysis />
          </motion.div>
        </div>

        {/* Journey + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-sa-gold" /> Your AI Journey
                    </h3>
                    <p className="text-sm text-muted-foreground">Complete each step to unlock your full potential</p>
                  </div>
                  <Target className="h-6 w-6 text-sa-terracotta" />
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
                </div>

                <div className="space-y-3">
                  {journeySteps.map((step, i) => {
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
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:border-sa-gold/30 hover:bg-sa-gold/5 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-xs font-display">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <span className="text-sm font-medium">
                            {step.label}
                          </span>
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
                <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-sa-gold" /> Profile Snapshot
                </h4>
                <div className="space-y-3">
                  <div><p className="text-xs text-muted-foreground">Province</p><p className="text-sm font-medium">{user?.province || "Not set"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Career Goals</p><p className="text-sm font-medium">{user?.interests?.slice(0, 2).join(" • ") || "Not set yet"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Top Skills</p><p className="text-sm font-medium">{user?.skills?.slice(0, 3).join(" • ") || "Add skills in profile"}</p></div>
                </div>
                <Link to="/dashboard/twin" className="mt-4 inline-flex items-center gap-2 text-xs text-sa-gold hover:text-sa-terracotta transition-colors font-medium">
                  Update profile <ArrowRight className="h-3 w-3" />
                </Link>
              </GlassCard>
            </motion.div>

            {quickActions.map((action, i) => (
              <motion.div key={action.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}>
                <Link to={action.path}>
                  <GlassCard className="group cursor-pointer hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform bg-primary/10">
                        <action.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
