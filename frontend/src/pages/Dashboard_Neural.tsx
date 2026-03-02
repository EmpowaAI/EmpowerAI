import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ChevronUp, Loader2, TrendingUp, Briefcase, FileText, Mic, Target, Zap, ArrowRight } from 'lucide-react'
import { useUser } from '../lib/user-context'
import { cn } from '../lib/utils'
import { statsAPI, opportunitiesAPI } from '../lib/api'

// Import Neural Fusion components
import HolographicButton from '../components/ui/HolographicButton'
import NeuralCard from '../components/ui/NeuralCard'
import AIAvatar from '../components/ui/AIAvatar'
import NeuralLoading from '../components/ui/NeuralLoading'

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
        const response = await opportunitiesAPI.getAll()
        
        if (response.status === 'success' && response.data?.opportunities) {
          const opportunities = response.data.opportunities
            .slice(0, 3)
            .map((opp: any) => ({
              id: opp._id || opp.id,
              title: opp.title,
              company: opp.company || 'Company Name',
              type: opp.type || 'job',
              match: Math.floor(Math.random() * 30) + 70, // Mock match score
              posted: opp.createdAt 
                ? new Date(opp.createdAt).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
                : 'Recently'
            }))
          
          setRecommendedJobs(opportunities)
        }
      } catch (error) {
        console.error('Failed to load recommended jobs:', error)
      } finally {
        setJobsLoading(false)
      }
    }
    
    fetchRecommendedJobs()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Section with Neural Components */}
      <NeuralCard className="text-center">
        <div className="flex items-center justify-center gap-6 mb-6">
          <AIAvatar size="xl" variant="default" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Welcome back, {displayName}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your economic twin is ready. Let's build your future today.
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6">
          <div className="text-center p-4 bg-primary/10 rounded-xl border border-primary/20">
            {loading ? (
              <NeuralLoading size="lg" />
            ) : (
              <>
                <p className="text-3xl font-bold text-primary">{stats?.empowermentScore || 0}</p>
                <p className="text-sm text-muted-foreground">Empowerment Score</p>
              </>
            )}
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-xl border border-accent/20">
            {loading ? (
              <NeuralLoading size="lg" />
            ) : (
              <>
                <p className="text-3xl font-bold text-accent">R{((stats?.threeMonthProjection || 0) / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground">3-Month Projection</p>
              </>
            )}
          </div>
        </div>
      </NeuralCard>

      {/* Stats Grid with Neural Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Skills Matched", 
            value: loading ? "..." : String(stats?.skillsMatched || 0), 
            change: "+3 this week", 
            color: "primary" 
          },
          { 
            label: "Opportunities", 
            value: loading ? "..." : String(stats?.opportunitiesCount || 0), 
            change: "Available now", 
            color: "accent" 
          },
          { 
            label: "Interviews Practiced", 
            value: loading ? "..." : String(stats?.interviewsPracticed || 0), 
            change: "Start practicing", 
            color: "secondary" 
          },
          { 
            label: "CV Score", 
            value: loading ? "..." : `${stats?.cvScore || 0}%`, 
            change: "+8% improved", 
            color: "primary" 
          },
        ].map((stat, i) => (
          <NeuralCard key={stat.label} className="hover:scale-105 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-sm font-medium text-primary">{stat.change}</p>
          </NeuralCard>
        ))}
      </div>

      {/* Quick Actions with Neural Buttons */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: TrendingUp,
              title: "Run Simulation",
              desc: "Compare career pathways",
              path: "/dashboard/simulations",
            },
            {
              icon: Briefcase,
              title: "Browse Opportunities",
              desc: "Find jobs and learnerships",
              path: "/dashboard/opportunities",
            },
            {
              icon: FileText,
              title: "Analyze CV",
              desc: "Get AI-powered feedback",
              path: "/dashboard/cv-analyzer",
            },
            {
              icon: Mic,
              title: "Practice Interview",
              desc: "Build your confidence",
              path: "/dashboard/interview-coach",
            },
            {
              icon: Target,
              title: "View Roadmap",
              desc: "Track your progress",
              path: "/dashboard/twin",
            },
            {
              icon: Zap,
              title: "Neural Fusion",
              desc: "Experience AI features",
              path: "/neural-fusion",
            },
          ].map((action, i) => (
            <Link
              key={action.title}
              to={action.path}
              className="block"
            >
              <NeuralCard className="hover:scale-105 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.desc}</p>
              </NeuralCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recommended For You</h2>
            <p className="text-sm text-muted-foreground">Based on your skills and preferences</p>
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
              <NeuralCard key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-4" />
                <div className="h-6 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded mb-4" />
                <div className="h-8 bg-muted rounded" />
              </NeuralCard>
            ))}
          </div>
        ) : recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => (
              <Link
                key={job.id}
                to={`/dashboard/opportunities#${job.id}`}
                className="block"
              >
                <NeuralCard className="hover:scale-105 transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full font-semibold">
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
                </NeuralCard>
              </Link>
            ))}
          </div>
        ) : (
          <NeuralCard className="text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Opportunities Available</h3>
            <p className="text-muted-foreground mb-4">Check back later or browse all opportunities to find matches.</p>
            <Link
              to="/dashboard/opportunities"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Browse All Opportunities <ArrowRight className="h-4 w-4" />
            </Link>
          </NeuralCard>
        )}
      </div>
    </div>
  )
}
