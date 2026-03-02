import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ChevronUp, Loader2, TrendingUp, Briefcase, FileText, Mic, Target, Zap, ArrowRight, Award } from 'lucide-react'
import { useUser } from '../lib/user-context'
import { cn } from '../lib/utils'
import { gamificationAPI } from '../lib/api'

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
  const [gamificationData, setGamificationData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        setLoading(true)
        const response = await gamificationAPI.getUserGamification()
        if (response.status === 'success' && response.data) {
          setGamificationData(response.data)
        }
      } catch (error) {
        console.error('Failed to load gamification data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchGamificationData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Section - Premium */}
      <div className="premium-card p-8 premium-animate-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="premium-badge premium-badge-primary mb-3">
              Welcome back
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">
              Hi {displayName}, ready to grow?
            </h1>
            <p className="premium-body">
              Track your progress and discover new opportunities today
            </p>
          </div>
          {!loading && gamificationData && (
            <div className="text-right">
              <div className="premium-badge premium-badge-success mb-2">
                <Award className="h-3 w-3" />
                Level {gamificationData.level}
              </div>
              <div className="text-sm text-[#737373]">
                {gamificationData.xp} XP
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Clean */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="premium-card p-6 animate-pulse">
              <div className="h-8 w-8 bg-[#f5f5f5] dark:bg-[#262626] rounded-lg mb-4"></div>
              <div className="h-8 bg-[#f5f5f5] dark:bg-[#262626] rounded mb-2"></div>
              <div className="h-4 bg-[#f5f5f5] dark:bg-[#262626] rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: TrendingUp,
              label: "Empowerment Score",
              value: "78%",
              change: "+12% this month",
              color: "#2563eb"
            },
            {
              icon: Briefcase,
              label: "Opportunities",
              value: "24",
              change: "3 new today",
              color: "#06b6d4"
            },
            {
              icon: FileText,
              label: "CV Score",
              value: "85/100",
              change: "Excellent",
              color: "#10b981"
            },
            {
              icon: Mic,
              label: "Interviews Practiced",
              value: "7",
              change: "2 this week",
              color: "#f59e0b"
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="premium-card p-6 premium-hover-lift premium-animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-[#0a0a0a] dark:text-[#fafafa]">
                {stat.value}
              </div>
              <div className="text-sm text-[#525252] dark:text-[#a3a3a3] mb-2">
                {stat.label}
              </div>
              <div className="text-xs font-medium" style={{ color: stat.color }}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions - Premium Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-[#0a0a0a] dark:text-[#fafafa]">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: "Analyze CV",
              description: "Get AI-powered feedback on your CV",
              link: "/dashboard/cv-analyzer",
              color: "#2563eb",
              badge: "Popular"
            },
            {
              icon: Mic,
              title: "Practice Interview",
              description: "Prepare with AI mock interviews",
              link: "/dashboard/interview-coach",
              color: "#06b6d4",
              badge: null
            },
            {
              icon: Target,
              title: "Build Digital Twin",
              description: "Create your career profile",
              link: "/dashboard/twin",
              color: "#10b981",
              badge: null
            },
            {
              icon: Zap,
              title: "Career Simulations",
              description: "Explore potential career paths",
              link: "/dashboard/simulations",
              color: "#f59e0b",
              badge: null
            },
            {
              icon: Briefcase,
              title: "Find Opportunities",
              description: "Browse matched jobs and courses",
              link: "/dashboard/opportunities",
              color: "#8b5cf6",
              badge: "24 new"
            },
            {
              icon: Sparkles,
              title: "View Profile",
              description: "Manage your account settings",
              link: "/dashboard/profile",
              color: "#ef4444",
              badge: null
            },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="premium-card premium-card-interactive p-6 premium-animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${action.color}15` }}>
                  <action.icon className="h-6 w-6" style={{ color: action.color }} />
                </div>
                {action.badge && (
                  <span className="premium-badge premium-badge-primary text-xs">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">
                {action.title}
              </h3>
              <p className="premium-body-small mb-4">
                {action.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: action.color }}>
                Get started
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#0a0a0a] dark:text-[#fafafa]">Recommended for You</h2>
          <Link
            to="/dashboard/opportunities"
            className="text-sm font-medium text-[#2563eb] hover:text-[#1e40af] transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Senior Software Developer",
              company: "Tech Corp",
              type: "Full-time",
              match: 92,
              location: "Gauteng",
              salary: "R45k - R65k"
            },
            {
              title: "Data Analyst",
              company: "Analytics Pro",
              type: "Remote",
              match: 88,
              location: "Western Cape",
              salary: "R35k - R50k"
            },
            {
              title: "Digital Marketing Manager",
              company: "Marketing Inc",
              type: "Hybrid",
              match: 85,
              location: "KZN",
              salary: "R40k - R55k"
            },
          ].map((job, index) => (
            <Link
              key={index}
              to="/dashboard/opportunities"
              className="premium-card p-6 premium-hover-lift premium-animate-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 text-[#0a0a0a] dark:text-[#fafafa]">
                    {job.title}
                  </h3>
                  <p className="premium-body-small">{job.company}</p>
                </div>
                <div className="premium-badge premium-badge-success">
                  {job.match}% match
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#737373]">
                  <span className="px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#262626] text-xs">
                    {job.type}
                  </span>
                  <span>{job.location}</span>
                </div>
                <div className="text-sm font-medium text-[#2563eb]">
                  {job.salary}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium text-[#2563eb]">
                View details
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="premium-card p-8 bg-[#2563eb]/5 dark:bg-[#2563eb]/10 border-[#2563eb]/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#2563eb]">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">
              💡 Tip of the Day
            </h3>
            <p className="premium-body mb-4">
              Update your CV with new skills and certifications to increase your empowerment score and get matched with better opportunities.
            </p>
            <Link
              to="/dashboard/cv-analyzer"
              className="premium-btn premium-btn-primary"
            >
              Update CV now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
