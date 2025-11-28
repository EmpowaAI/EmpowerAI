import { Link } from "react-router-dom"
import { TrendingUp, Target, Briefcase, FileText, Mic, ArrowRight, Zap } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section - Updated gradient to primary/secondary */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Welcome back, Asanda!</h1>
            <p className="text-muted-foreground">Your economic twin is ready. Let's build your future today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">78</p>
              <p className="text-sm text-muted-foreground">Empowerment Score</p>
            </div>
            <div className="h-16 w-px bg-border"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">R4.2K</p>
              <p className="text-sm text-muted-foreground">3-Month Projection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Skills Matched", value: "12", change: "+3 this week" },
          { label: "Opportunities", value: "28", change: "8 new today" },
          { label: "Interviews Practiced", value: "5", change: "85% avg score" },
          { label: "CV Score", value: "72%", change: "+8% improved" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            <p className="text-xs text-secondary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mt-4">{action.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Recommended For You</h2>
          <Link to="/dashboard/opportunities" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Junior Web Developer", company: "TechCo SA", type: "Full-time", match: 92 },
            { title: "Digital Marketing Learnership", company: "MediaHouse", type: "Learnership", match: 88 },
            { title: "IT Support Internship", company: "FinServe", type: "Internship", match: 85 },
          ].map((job, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full font-medium">
                  {job.match}% match
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
              <span className="inline-block mt-3 px-2 py-1 bg-muted text-xs text-muted-foreground rounded">
                {job.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
