import { Link } from "react-router-dom"
import { TrendingUp, Target, Briefcase, FileText, Mic, ArrowRight, Zap } from "lucide-react"
import { useUser } from "../lib/user-context"

export default function Dashboard() {
  const { user } = useUser()
  const displayName = user?.name?.split(" ")[0] || "there"

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Welcome back, {displayName}!</h1>
            <p className="text-sm text-muted-foreground">Your economic twin is ready. Let's build your future today.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">78</p>
              <p className="text-xs text-muted-foreground">Empowerment Score</p>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">R4.2K</p>
              <p className="text-xs text-muted-foreground">3-Month Projection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Skills Matched", value: "12", change: "+3 this week" },
          { label: "Opportunities", value: "28", change: "8 new today" },
          { label: "Interviews Practiced", value: "5", change: "85% avg score" },
          { label: "CV Score", value: "72%", change: "+8% improved" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
            <p className="text-xs text-secondary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              icon: TrendingUp,
              title: "Run Simulation",
              desc: "Compare career pathways",
              path: "/dashboard/simulations",
              color: "text-primary",
            },
            {
              icon: Briefcase,
              title: "Browse Opportunities",
              desc: "Find jobs and learnerships",
              path: "/dashboard/opportunities",
              color: "text-accent",
            },
            {
              icon: FileText,
              title: "Analyze CV",
              desc: "Get AI-powered feedback",
              path: "/dashboard/cv-analyzer",
              color: "text-secondary",
            },
            {
              icon: Mic,
              title: "Practice Interview",
              desc: "Build your confidence",
              path: "/dashboard/interview",
              color: "text-warning",
            },
            {
              icon: Target,
              title: "View Roadmap",
              desc: "Track your progress",
              path: "/dashboard/twin",
              color: "text-destructive",
            },
            {
              icon: Zap,
              title: "Update Twin",
              desc: "Add new skills",
              path: "/dashboard/twin",
              color: "text-primary",
            },
          ].map((action, i) => (
            <Link
              key={i}
              to={action.path}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-medium text-foreground mt-3 text-sm">{action.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recommended For You</h2>
          <Link to="/dashboard/opportunities" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "Junior Web Developer", company: "TechCo SA", type: "Full-time", match: 92 },
            { title: "Digital Marketing Learnership", company: "MediaHouse", type: "Learnership", match: 88 },
            { title: "IT Support Internship", company: "FinServe", type: "Internship", match: 85 },
          ].map((job, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-medium">
                  {job.match}% match
                </span>
              </div>
              <h3 className="font-medium text-foreground text-sm">{job.title}</h3>
              <p className="text-xs text-muted-foreground">{job.company}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-muted text-xs text-muted-foreground rounded">
                {job.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
