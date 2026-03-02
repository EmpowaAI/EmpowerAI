import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Briefcase, FileText, Mic, Target, ArrowRight, Brain, Users, Award, Calendar, BarChart3 } from 'lucide-react'
import { useUser } from '../lib/user-context'
import { cn } from '../lib/utils'
import { statsAPI, opportunitiesAPI } from '../lib/api'

// Clean Components
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Loading from '../components/ui/Loading'

interface DashboardStats {
  empowermentScore: number
  threeMonthProjection: number
  skillsMatched: number
  opportunitiesCount: number
  interviewsPracticed: number
  cvScore: number
  weeklyProgress: number
  totalApplications: number
  interviewSuccessRate: number
}

interface RecommendedOpportunity {
  id: string
  title: string
  company: string
  type: string
  match: number
  posted: string
  salary?: string
  location?: string
}

interface RecentActivity {
  id: string
  type: 'cv_upload' | 'interview' | 'application' | 'achievement'
  title: string
  timestamp: string
  score?: number
}

export default function Dashboard() {
  const { user } = useUser()
  const displayName = user?.name?.split(" ")[0] || "there"
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedOpportunity[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch stats
        const statsResponse = await statsAPI.getDashboardStats()
        if (statsResponse.status === 'success' && statsResponse.data) {
          setStats(statsResponse.data)
        }
        
        // Fetch recommended jobs
        const jobsResponse = await opportunitiesAPI.getRecommendedJobs()
        if (jobsResponse.status === 'success' && jobsResponse.data) {
          setRecommendedJobs(jobsResponse.data.slice(0, 3))
        }
        
        // Mock recent activity (would come from API)
        setRecentActivity([
          {
            id: '1',
            type: 'cv_upload',
            title: 'CV Analyzed - 8D Score: 85/100',
            timestamp: '2 hours ago',
            score: 85
          },
          {
            id: '2',
            type: 'interview',
            title: 'Interview Practice Completed',
            timestamp: '1 day ago',
            score: 92
          },
          {
            id: '3',
            type: 'achievement',
            title: 'Achievement Unlocked: Interview Pro',
            timestamp: '3 days ago'
          }
        ])
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
        setJobsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loading size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-error'
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cv_upload': return <FileText className="h-4 w-4" />
      case 'interview': return <Mic className="h-4 w-4" />
      case 'application': return <Briefcase className="h-4 w-4" />
      case 'achievement': return <Award className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Your career transformation journey continues. Here's your progress.
          </p>
        </div>
        <Avatar size="xl" variant="primary" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">+12% this week</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {stats?.empowermentScore || 0}/100
            </p>
            <p className="text-sm text-muted-foreground">Empowerment Score</p>
          </div>
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats?.empowermentScore || 0}%` }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground">3 month projection</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              R{(stats?.threeMonthProjection || 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Potential Salary</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-xs text-muted-foreground">New this week</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {stats?.opportunitiesCount || 0}
            </p>
            <p className="text-sm text-muted-foreground">Job Opportunities</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-warning" />
            </div>
            <span className="text-xs text-muted-foreground">Success rate</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {stats?.interviewSuccessRate || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Interview Success</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Opportunities */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recommended Opportunities</h2>
              <Link to="/dashboard/opportunities">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{job.type}</span>
                        {job.salary && <span>{job.salary}</span>}
                        {job.location && <span>{job.location}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary mb-1">{job.match}%</div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No opportunities available yet</p>
                  <Link to="/dashboard/cv-analyzer">
                    <Button>Complete CV Analysis</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    {activity.score && (
                      <div className="mt-2">
                        <span className={cn("text-sm font-semibold", getScoreColor(activity.score))}>
                          {activity.score}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/dashboard/cv-analyzer">
            <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Analyze CV</h3>
              <p className="text-sm text-muted-foreground">Get 8D analysis</p>
            </Card>
          </Link>
          
          <Link to="/dashboard/interview-coach">
            <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
              <Mic className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-medium text-foreground mb-1">Practice Interview</h3>
              <p className="text-sm text-muted-foreground">Improve skills</p>
            </Card>
          </Link>
          
          <Link to="/dashboard/twin">
            <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
              <Users className="h-8 w-8 text-secondary mb-3" />
              <h3 className="font-medium text-foreground mb-1">Digital Twin</h3>
              <p className="text-sm text-muted-foreground">Career simulations</p>
            </Card>
          </Link>
          
          <Link to="/dashboard/opportunities">
            <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
              <Target className="h-8 w-8 text-warning mb-3" />
              <h3 className="font-medium text-foreground mb-1">Find Jobs</h3>
              <p className="text-sm text-muted-foreground">AI matching</p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  )
}
