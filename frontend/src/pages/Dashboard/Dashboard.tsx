// frontend/src/pages/Dashboard/Dashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Briefcase, FileText, ArrowRight, Sparkles,
  Brain, MessageSquare, BarChart3, ChevronRight,
  CheckCircle, AlertCircle, Users, GraduationCap,
} from "lucide-react";
import { RefreshCcw } from "lucide-react";
import ScoreMeter from "../../components/ui/ScoreMeter";
import GlassCard from "../../components/shared/GlassCard";
import AIThinkingIndicator from "../../components/AIThinkingIndicator";
import FirstTimeUserOnboarding from "../../components/FirstTimeUserOnboarding";
import LiveInsightsFeed from "../../components/LiveInsightsFeed";
import SAJobPlatforms from "../../components/SAJobPlatforms";
import { useUser } from "../../contexts/user-context";
import { applicationsAPI, statsAPI } from "../../lib/api";
import { getStoredCvAnalysis } from "../../lib/sensitiveStorage";

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

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiThinking, setAiThinking] = useState(true);
  const [aiMessage, setAiMessage] = useState("Initialising your AI twin...");
  const [dataSource, setDataSource] = useState<"live" | "cached">("cached");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [cvData, setCvData] = useState<any | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    location: "",
    careerGoals: [],
    topSkills: [],
  });
  
  // Reactive completion status
  const [twinCompleted, setTwinCompleted] = useState(false);
  const [cvCompleted, setCvCompleted] = useState(false);
  
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

  // Check localStorage for completion status and profile data
  useEffect(() => {
    const checkCompletionStatus = () => {
      try {
        // Check twin completion
        const twinData = localStorage.getItem('twinData');
        setTwinCompleted(!!twinData);
        
        // Check CV completion
        const cvAnalysis = null;
        setCvCompleted(localStorage.getItem('cvCompleted') === 'true');
        setCvData(null);
        
        let topSkills: string[] = [];
        try {
          const raw = localStorage.getItem('cvSkills');
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) topSkills = parsed.slice(0, 5);
        } catch {
          // ignore parse errors
        }

        const baseName = user?.name || "Career Seeker";
        const baseLocation = user?.province || user?.location || "South Africa";

        if (twinData) {
          // Prefer twin data when available
          const parsedTwin = JSON.parse(twinData);
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
      } catch (e) {
        console.error('Error checking completion status:', e);
      }
    };

    // Initial check
    checkCompletionStatus();

    // Listen for storage events (updates from other tabs)
    window.addEventListener('storage', checkCompletionStatus);

    // Custom event for same-tab updates
    window.addEventListener('twinCompleted', checkCompletionStatus);
    window.addEventListener('cvCompleted', checkCompletionStatus);

    return () => {
      window.removeEventListener('storage', checkCompletionStatus);
      window.removeEventListener('twinCompleted', checkCompletionStatus);
      window.removeEventListener('cvCompleted', checkCompletionStatus);
    };
  }, [user]);

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

    const loadDashboard = async (opts?: { silent?: boolean }) => {
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
          setStats({
            empowermentScore: Number(liveStats.empowermentScore) || 0,
            cvScore: Number(liveStats.cvScore) || 0,
            interviewScore: Number(liveStats.interviewsPracticed) || 0,
            skillsMatched: Number(liveStats.skillsMatched) || 0,
            opportunitiesCount: Number(liveStats.opportunitiesCount) || 0,
            applicationsCount: Number(appStats?.total) || 0,
            learnershipsCount: undefined,
          });
          setLastUpdatedAt(new Date());
        } else {
          // Cached fallback (localStorage) if the API is unreachable
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
          } catch (e) {
            // ignore
          }
          try {
            const twinData = localStorage.getItem("twinData");
            if (twinData) {
              const parsed = JSON.parse(twinData);
              empowermentScore = Number(parsed?.empowermentScore) || 0;
            }
          } catch (e) {
            // ignore
          }

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
    };

    loadDashboard();

    return () => { 
      clearInterval(interval); 
    };
  }, []);

  const quickActions = [
    { icon: FileText, title: "Analyse CV", desc: "Get AI-powered CV insights for the SA market", path: "/dashboard/cv-analyzer", accent: "from-amber-500/20 to-amber-500/5", label: "Improve CV" },
    { icon: MessageSquare, title: "Interview Coach", desc: "Practise with SA-specific interview questions", path: "/dashboard/interview-coach", accent: "from-orange-500/20 to-orange-500/5", label: "Practice" },
    { icon: Briefcase, title: "Find Opportunities", desc: "AI-matched jobs, learnerships & graduate programmes", path: "/dashboard/opportunities", accent: "from-green-500/20 to-green-500/5", label: "Explore roles" },
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
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-500/4 via-transparent to-green-500/6" />
      <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl z-0" />
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-green-500/10 blur-3xl z-0" />
      
      {/* Additional atmospheric effects */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl z-0" />
      <div className="absolute bottom-1/3 right-1/3 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">

        <AIThinkingIndicator messages={[aiMessage]} isVisible={aiThinking} />

        {/* First-time user onboarding guide */}
        {!twinCompleted && !cvCompleted && <FirstTimeUserOnboarding />}

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassCard className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/20 to-transparent rounded-full blur-3xl -ml-24 -mb-24" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI Command Centre
                  </motion.span>
                  <span className="text-xs text-muted-foreground">{dataSource === "live" ? "Live data" : "Cached data"}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">Updated {formatLastUpdated(lastUpdatedAt)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      // trigger a silent refresh (keeps layout stable)
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      (async () => {
                        try {
                          setIsRefreshing(true);
                          const statsRes = await statsAPI.getDashboardStats();
                          const appsRes = await applicationsAPI.getStats().catch(() => null);
                          const liveStats = statsRes?.data || null;
                          if (liveStats) {
                            setDataSource("live");
                            setStats({
                              empowermentScore: Number(liveStats.empowermentScore) || 0,
                              cvScore: Number(liveStats.cvScore) || 0,
                              interviewScore: Number(liveStats.interviewsPracticed) || 0,
                              skillsMatched: Number(liveStats.skillsMatched) || 0,
                              opportunitiesCount: Number(liveStats.opportunitiesCount) || 0,
                              applicationsCount: Number((appsRes as any)?.data?.total) || 0,
                              learnershipsCount: undefined,
                            });
                            setLastUpdatedAt(new Date());
                          }
                        } finally {
                          setIsRefreshing(false);
                        }
                      })();
                    }}
                    disabled={isRefreshing}
                    className="ml-1 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
                    aria-label="Refresh dashboard"
                    title="Refresh"
                  >
                    <RefreshCcw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-display mb-3 font-bold">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold">{displayName}</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                  Your AI twin is actively analysing the SA career landscape for you.
                </motion.p>

                {loading && !stats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[0, 1, 2].map((k) => (
                      <div key={k} className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 animate-pulse">
                        <div className="h-3 w-24 bg-muted/50 rounded" />
                        <div className="h-4 w-16 bg-muted/50 rounded mt-2" />
                      </div>
                    ))}
                  </div>
                ) : (!loading && stats ? (
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
                ) : null)}
              </div>

              {loading && (
                <div className="flex items-center gap-4">
                  <div className="text-center p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-lg animate-pulse">
                    <div className="h-[120px] w-[120px] rounded-full bg-muted/50 mx-auto" />
                    <div className="h-4 w-40 bg-muted/50 rounded mt-4 mx-auto" />
                  </div>
                </div>
              )}

              {!loading && stats && stats.empowermentScore > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
                  <div className="text-center p-6 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-lg">
                    <ScoreMeter score={stats.empowermentScore} label="Empowerment" size="lg" />
                    <p className="mt-3 text-sm font-semibold text-foreground">Your current trajectory</p>
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Next best action */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
          <Link to={nextStep.path}>
            <GlassCard className="group cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden border-amber-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/12 via-transparent to-green-500/10 opacity-70" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-amber-500 font-semibold">Recommended next step</p>
                    <p className="text-lg font-display font-bold">{nextStep.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {nextStep.label.includes("CV")
                        ? "Unlock better matching and a stronger profile in minutes."
                        : nextStep.label.includes("Twin")
                          ? "Personalize your insights and projections."
                          : nextStep.label.includes("Interview")
                            ? "Practice and improve your readiness score."
                            : "Start applying to real opportunities."}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-500">
                  Get started <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </GlassCard>
          </Link>
        </motion.div>

        {/* Score Cards */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[0, 1].map((k) => (
              <GlassCard key={k} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-border/50 shadow-md animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-muted/50 border border-border/30" />
                  <div>
                    <div className="h-3 w-28 bg-muted/50 rounded" />
                    <div className="h-3 w-44 bg-muted/50 rounded mt-2" />
                  </div>
                </div>
                <div className="h-[120px] w-[120px] rounded-full bg-muted/50 self-center md:self-auto" />
              </GlassCard>
            ))}
          </div>
        )}

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
                      <p className="text-sm text-amber-500 mt-2 flex items-center justify-center md:justify-end gap-1 font-semibold">
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
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((k) => (
              <GlassCard key={k} className="group border-2 border-border/50 shadow-md animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-3 w-24 bg-muted/50 rounded" />
                  <div className="h-12 w-12 rounded-xl bg-muted/50 border border-border/30" />
                </div>
                <div className="h-9 w-16 bg-muted/50 rounded" />
                <div className="h-3 w-32 bg-muted/50 rounded mt-3" />
              </GlassCard>
            ))}
          </div>
        )}

        {!loading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Skills Matched", value: stats.skillsMatched, icon: BarChart3, color: "text-amber-500" },
              { label: "Opportunities", value: stats.opportunitiesCount, icon: Briefcase, color: "text-green-500" },
              { label: "Learnerships", value: stats.learnershipsCount || 0, icon: GraduationCap, color: "text-orange-500" },
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
                  <p className="text-sm text-muted-foreground mt-2 font-medium">
                    Updated from {dataSource === "live" ? "live data" : "cached data"}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Content Grid - REPLACED SkillGapAnalysis with SAJobPlatforms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <LiveInsightsFeed />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <SAJobPlatforms />
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
                      <Brain className="h-5 w-5 text-amber-500" /> Your AI Journey
                    </h3>
                    <p className="text-sm text-muted-foreground">Your next best action is highlighted below.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
                    <p className="text-sm font-semibold text-amber-500">{progressPercentage}%</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
                    <span className="text-xs font-bold text-amber-500">{progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Next step: <span className="text-foreground font-medium">{nextStep.label}</span></p>
                </div>

                <div className="space-y-3">
                  {journeySteps.map((step, i) => {
                    const isNext = nextStep?.label === step.label && !step.completed;
                    
                    if (step.completed) {
                      return (
                        <div
                          key={step.label}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 opacity-75 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-500/20 border border-green-500/50 text-green-500 flex items-center justify-center text-xs font-display">
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

                    return (
                      <Link
                        key={step.label}
                        to={step.path}
                        className={`flex items-center justify-between p-4 rounded-xl border ${isNext ? "border-amber-500/50 bg-amber-500/10" : "border-border/50 bg-muted/20"} hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center text-xs font-display">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{step.label}</span>
                            {isNext && <p className="text-[11px] text-amber-500">Recommended next action</p>}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
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
                  <Users className="h-4 w-4 text-amber-500" /> AI Profile Snapshot
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{profileData.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Career Goals</p>
                    <p className="text-sm font-medium">
                      {profileData.careerGoals.join(' • ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Top Skills</p>
                    <p className="text-sm font-medium">
                      {profileData.topSkills.length > 0 
                        ? profileData.topSkills.join(' • ')
                        : 'No skills detected yet'
                      }
                    </p>
                  </div>
                </div>
                <Link to="/dashboard/twin" className="mt-4 inline-flex items-center gap-2 text-xs text-amber-500 hover:text-orange-500 transition-colors font-medium">
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
                      <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold border border-amber-500/30 rounded-full px-3 py-1.5">
                        {action.label}
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              <GlassCard className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20" />
                    <Brain className="h-8 w-8 text-amber-500 relative" />
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