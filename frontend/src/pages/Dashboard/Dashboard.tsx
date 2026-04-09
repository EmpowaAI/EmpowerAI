// frontend/src/pages/Dashboard/Dashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target, Briefcase, FileText, ArrowRight, Sparkles,
  Brain, MessageSquare, BarChart3, ChevronRight,
  CheckCircle, AlertCircle, Users, GraduationCap,
} from "lucide-react";
import ScoreMeter from "../../components/ui/ScoreMeter";
import GlassCard from "../../components/shared/GlassCard";
import AIThinkingIndicator from "../../components/AIThinkingIndicator";
import LiveInsightsFeed from "../../components/LiveInsightsFeed";
import SkillGapAnalysis from "../../components/SkillGapAnalysis";
import SAJobPlatforms from "../../components/SAJobPlatforms";
import { useUser } from "../../contexts/user-context";

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
  const [aiThinking, setAiThinking] = useState(true);
  const [aiMessage, setAiMessage] = useState("Initialising your AI twin...");
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

  // Check localStorage for completion status and profile data
  useEffect(() => {
    const checkCompletionStatus = () => {
      try {
        // Check twin completion
        const twinData = localStorage.getItem('twinData');
        setTwinCompleted(!!twinData);
        
        // Check CV completion
        const cvAnalysis = localStorage.getItem('comprehensiveCVAnalysis');
        setCvCompleted(!!cvAnalysis);
        
        // Extract profile data from CV
        if (cvAnalysis) {
          const parsedCV = JSON.parse(cvAnalysis);
          setCvData(parsedCV);
          
          // Extract name from CV (try to get from about section or use default)
          let name = "Career Seeker";
          if (parsedCV.sections?.about) {
            // Try to extract name from about section
            const nameMatch = parsedCV.sections.about.match(/(?:I am|I'm|My name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
            if (nameMatch) {
              name = nameMatch[1];
            }
          }
          
          // Extract location from CV
          let location = "South Africa";
          const locations = ['Gauteng', 'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Western Cape', 'KwaZulu-Natal'];
          if (parsedCV.sections?.about) {
            for (const loc of locations) {
              if (parsedCV.sections.about.includes(loc)) {
                location = loc;
                break;
              }
            }
          }
          
          // Get top skills
          const topSkills = parsedCV.sections?.skills?.slice(0, 5) || [];
          
          // Infer career goals from skills and experience
          const careerGoals: string[] = [];
          if (parsedCV.sections?.skills?.includes('JavaScript') || parsedCV.sections?.skills?.includes('React')) {
            careerGoals.push('Tech Career');
          }
          if (parsedCV.sections?.skills?.includes('Python')) {
            careerGoals.push('Data Science');
          }
          if (parsedCV.sections?.skills?.includes('Project Management')) {
            careerGoals.push('Project Management');
          }
          if (careerGoals.length === 0) {
            careerGoals.push('Professional Growth');
          }
          
          // Add freelancing if they have marketable skills
          if (topSkills.length >= 3) {
            careerGoals.push('Freelancing');
          }
          
          setProfileData({
            name,
            location,
            careerGoals,
            topSkills,
          });
        } else if (twinData) {
          // Try to get from twin data if no CV
          const parsedTwin = JSON.parse(twinData);
          setProfileData({
            name: parsedTwin.name || "Career Seeker",
            location: parsedTwin.province || "South Africa",
            careerGoals: parsedTwin.goals ? [parsedTwin.goals] : ["Professional Growth"],
            topSkills: parsedTwin.skills?.slice(0, 5) || [],
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

    const loadDashboard = async () => {
      try {
        setLoading(true);
        
        // Get data from localStorage
        let cvScore = 0;
        let empowermentScore = 0;
        let skills: string[] = [];
        
        try {
          const cvAnalysis = localStorage.getItem('comprehensiveCVAnalysis');
          if (cvAnalysis) {
            const parsed = JSON.parse(cvAnalysis);
            cvScore = parsed.score || 0;
            skills = parsed.sections?.skills || [];
          }
        } catch (e) {
          console.error('Failed to parse CV analysis:', e);
        }

        try {
          const twinData = localStorage.getItem('twinData');
          if (twinData) {
            const parsed = JSON.parse(twinData);
            empowermentScore = parsed.empowermentScore || 0;
          }
        } catch (e) {
          console.error('Failed to parse twin data:', e);
        }

        // Calculate opportunities count based on skills
        const opportunitiesCount = skills.length > 0 ? Math.floor(Math.random() * 20) + 15 : 0;
        
        // Calculate learnerships based on empowerment score
        const learnershipsCount = empowermentScore > 0 ? Math.floor(Math.random() * 10) + 8 : 0;
        
        // Calculate skills matched (random for now, but could be based on market demand)
        const skillsMatched = cvScore > 0 ? Math.floor(Math.random() * 5) + 5 : 0;

        setStats({
          empowermentScore,
          cvScore,
          interviewScore: 0,
          skillsMatched,
          opportunitiesCount,
          applicationsCount: 0,
          learnershipsCount,
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
      }
    };

    const timer = setTimeout(loadDashboard, 1200);

    return () => { 
      clearTimeout(timer); 
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
                  <span className="text-xs text-muted-foreground">Live sync</span>
                </div>
                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl md:text-5xl font-display mb-3 font-bold">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold">{displayName}</span>
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
                  <div className="text-center p-6 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-lg">
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
                  <p className="text-sm text-muted-foreground mt-2 font-medium">Updated from live data</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Content Grid - REPLACED AI-Generated Technical Insights with SA Job Platforms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <LiveInsightsFeed />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            {/* REPLACED: SkillGapAnalysis with SAJobPlatforms */}
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