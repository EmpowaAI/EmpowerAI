import DigitalTwinChatbot from "../components/DigitalTwinChatbot";
import { Link } from "react-router-dom"
import { TrendingUp, Target, Briefcase, FileText, Mic, ArrowRight, Zap, Sparkles, ChevronUp, Clock, Loader2 } from "lucide-react"
import { useUser } from "../lib/user-context"
import { cn } from "../lib/utils"
import { statsAPI, opportunitiesAPI } from "../lib/api"
import { useState, useEffect } from "react"

interface DashboardStats {
  empowermentScore: number
  threeMonthProjection: number
  skillsMatched: number
  opportunitiesCount: number
  interviewsPracticed: number
  cvScore: number
}

interface RecommendedOpportunity {
  id: string
  title: string
  company: string
  type: string
  match: number
  posted: string
}

export default function Dashboard() {
  const { user } = useUser()
  const displayName = user?.name?.split(" ")[0] || "there"
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedOpportunity[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await statsAPI.getDashboardStats()
        if (response.status === 'success' && response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
        // Don't set fallback values - show loading/empty state instead
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setJobsLoading(true)
        // Get user's province and skills for filtering
        const filters: { province?: string; skills?: string } = {}
        const userProvince = (user as any)?.province || localStorage.getItem('userProvince')
        if (userProvince) {
          filters.province = userProvince
        }
        
        const cvSkills = localStorage.getItem('cvSkills')
        if (cvSkills) {
          try {
            const skills = JSON.parse(cvSkills)
            if (Array.isArray(skills) && skills.length > 0) {
              filters.skills = skills.slice(0, 5).join(',')
            }
          } catch (e) {
            console.error('Error parsing CV skills:', e)
          }
        }
        
        const response = await opportunitiesAPI.getAll(filters)
        
        if (response.status === 'success' && response.data?.opportunities) {
          // Get top 3 opportunities sorted by match score
          const opportunities = response.data.opportunities
            .map((opp: any) => ({
              id: opp._id || opp.id,
              title: opp.title,
              company: opp.company || 'Company Name',
              type: opp.type || 'job',
              match: calculateMatchScore(opp, user),
              posted: opp.createdAt 
                ? new Date(opp.createdAt).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
                : 'Recently'
            }))
            .sort((a: RecommendedOpportunity, b: RecommendedOpportunity) => b.match - a.match)
            .slice(0, 3)
          
          setRecommendedJobs(opportunities)
        }
      } catch (error) {
        console.error('Failed to load recommended jobs:', error)
        // Don't show hardcoded fallback - just leave empty
      } finally {
        setJobsLoading(false)
      }
    }
    
    fetchRecommendedJobs()
  }, [user])

  const calculateMatchScore = (opp: any, user: any): number => {
    // Calculate match score based on skills, location, etc.
    let score = 50 // Base score
    
    const cvSkills = localStorage.getItem('cvSkills')
    if (cvSkills && opp.skills) {
      try {
        const userSkills = JSON.parse(cvSkills)
        const oppSkills = Array.isArray(opp.skills) ? opp.skills : []
        const matchingSkills = userSkills.filter((skill: string) => 
          oppSkills.some((oppSkill: string) => 
            oppSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(oppSkill.toLowerCase())
          )
        )
        score += matchingSkills.length * 10
      } catch (e) {
        console.error('Error calculating match score:', e)
      }
    }
    
    return Math.min(Math.max(score, 0), 100)
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 dark:from-indigo-700 dark:via-indigo-800 dark:to-indigo-900 rounded-xl p-6 md:p-8 shadow-xl border border-indigo-500/20 dark:border-indigo-600/20">
        {/* Background image overlay - subtle */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <img 
            src="/images/result.jpg" 
            alt="" 
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-indigo-700/80 dark:from-indigo-800/90 dark:to-indigo-900/90"></div>
        </div>
        
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}></div>
        </div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-in fade-in-up">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 animate-in fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="px-3 sm:px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/30 shadow-lg">
                <Sparkles className="h-3.5 w-3.5" /> AI-Powered
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight animate-in fade-in-up" style={{ animationDelay: '0.2s' }}>
              Welcome back, <span className="bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">{displayName}</span>!
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base md:text-lg max-w-md leading-relaxed animate-in fade-in-up" style={{ animationDelay: '0.3s' }}>
              Your economic twin is ready. Let's build your future today.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 animate-in fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center p-4 sm:p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center gap-2 mb-2">
                {loading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <>
                    <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {stats?.empowermentScore || 0}
                    </p>
                    <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300 animate-bounce" />
                  </>
                )}
              </div>
              <p className="text-xs font-medium text-indigo-100 uppercase tracking-wide">Empowerment Score</p>
            </div>
            <div className="h-12 sm:h-16 w-px bg-white/30 hidden sm:block"></div>
            <div className="text-center p-4 sm:p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 hover:scale-105">
              {loading ? (
                <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
              ) : (
                <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                  R{((stats?.threeMonthProjection || 0) / 1000).toFixed(1)}K
                </p>
              )}
              <p className="text-xs font-medium text-indigo-100 uppercase tracking-wide">3-Month Projection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Skills Matched", 
            value: loading ? "..." : String(stats?.skillsMatched || 0), 
            change: "+3 this week", 
            trend: "up" as const, 
            color: "primary" as const 
          },
          { 
            label: "Opportunities", 
            value: loading ? "..." : String(stats?.opportunitiesCount || 0), 
            change: "Available now", 
            trend: "up" as const, 
            color: "secondary" as const 
          },
          { 
            label: "Interviews Practiced", 
            value: loading ? "..." : String(stats?.interviewsPracticed || 0), 
            change: "Start practicing", 
            trend: "neutral" as const, 
            color: "warning" as const 
          },
          { 
            label: "CV Score", 
            value: loading ? "..." : `${stats?.cvScore || 0}%`, 
            change: "+8% improved", 
            trend: "up" as const, 
            color: "accent" as const 
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={cn(
              "bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-300 group relative overflow-hidden animate-in fade-in-up",
              "hover:scale-[1.02] hover:-translate-y-1"
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md",
                  stat.color === "primary" && "bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-700/50",
                  stat.color === "secondary" && "bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-700/50",
                  stat.color === "warning" && "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/50",
                  stat.color === "accent" && "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/50",
                )}
              >
                {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{stat.value}</p>
            <p
              className={cn("text-sm font-medium", stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="animate-in fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <span className="text-sm text-muted-foreground hidden sm:inline">Choose an action to get started</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              title: "Run Simulation",
              desc: "Compare career pathways",
              path: "/dashboard/simulations",
              gradient: "from-primary to-primary/70",
              bgColor: "bg-primary/5",
            },
            {
              icon: Briefcase,
              title: "Browse Opportunities",
              desc: "Find jobs and learnerships",
              path: "/dashboard/opportunities",
              gradient: "from-accent to-accent/70",
              bgColor: "bg-accent/5",
            },
            {
              icon: FileText,
              title: "Analyze CV",
              desc: "Get AI-powered feedback",
              path: "/dashboard/cv-analyzer",
              gradient: "from-secondary to-secondary/70",
              bgColor: "bg-secondary/5",
            },
            {
              icon: Mic,
              title: "Practice Interview",
              desc: "Build your confidence",
              path: "/dashboard/interview",
              gradient: "from-warning to-warning/70",
              bgColor: "bg-warning/5",
            },
            {
              icon: Target,
              title: "View Roadmap",
              desc: "Track your progress",
              path: "/dashboard/twin",
              gradient: "from-destructive to-destructive/70",
              bgColor: "bg-destructive/5",
            },
            {
              icon: Zap,
              title: "Update Twin",
              desc: "Add new skills",
              path: "/dashboard/twin",
              gradient: "from-primary to-secondary",
              bgColor: "bg-primary/5",
            },
          ].map((action, i) => (
            <Link
              key={i}
              to={action.path}
              className={cn(
              "group bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-300 relative overflow-hidden animate-in fade-in-up",
                "hover:scale-[1.02] hover:-translate-y-1"
              )}
              style={{ animationDelay: `${(i + 4) * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md",
                    i === 0 && "bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-700/50",
                    i === 1 && "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/50",
                    i === 2 && "bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-700/50",
                    i === 3 && "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/50",
                    i === 4 && "bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-700/50",
                    i === 5 && "bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-700/50",
                  )}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
            <h3 className="font-semibold text-foreground text-base mb-1">{action.title}</h3>
            <p className="text-sm text-muted-foreground">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recommended For You</h2>
            <p className="text-sm text-muted-foreground mt-1">Based on your skills and preferences</p>
          </div>
          <Link
            to="/dashboard/opportunities"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 sm:p-6 animate-pulse">
                <div className="h-12 w-12 rounded-lg bg-muted mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job, i) => (
              <Link
                key={job.id}
                to={`/dashboard/opportunities#${job.id}`}
                className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-md hover:border-primary/40 transition-all duration-200 group animate-in fade-in-up hover:scale-[1.02] hover:-translate-y-1"
                style={{ animationDelay: `${(i + 10) * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-semibold">
                      {job.match}% match
                    </span>
                    <span className="text-xs text-muted-foreground">{job.posted}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{job.company}</p>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 bg-muted text-xs text-muted-foreground rounded-full font-medium">
                    {job.type}
                  </span>
                  <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    View details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Opportunities Available</h3>
            <p className="text-muted-foreground mb-4">
              Check back later or browse all opportunities to find matches.
            </p>
            <Link
              to="/dashboard/opportunities"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Browse All Opportunities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
      <DigitalTwinChatbot />
    </div>
  )
}