import DigitalTwinChatbot from "../../../../../EmpowerAI/EmpowerAI/frontend/src/components/DigitalTwinChatbot";
import { Link } from "react-router-dom"
import { TrendingUp, Target, Briefcase, FileText, Mic, ArrowRight, Zap, Sparkles, ChevronUp, Clock } from "lucide-react"
import { useUser } from "../lib/user-context"
import { cn } from "../lib/utils"

export default function Dashboard() {
  const { user } = useUser()
  const displayName = user?.name?.split(" ")[0] || "there"

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-2xl p-6 md:p-8 shadow-xl shadow-primary/20 animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> AI-Powered
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {displayName}!</h1>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              Your economic twin is ready. Let's build your future today.
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-3xl font-bold text-white">78</p>
                <ChevronUp className="h-5 w-5 text-accent" />
              </div>
              <p className="text-xs text-white/70">Empowerment Score</p>
            </div>
            <div className="h-16 w-px bg-white/20"></div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-3xl font-bold text-white">R4.2K</p>
              <p className="text-xs text-white/70">3-Month Projection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Skills Matched", value: "12", change: "+3 this week", trend: "up", color: "primary" },
          { label: "Opportunities", value: "28", change: "8 new today", trend: "up", color: "secondary" },
          { label: "Interviews Practiced", value: "5", change: "85% avg score", trend: "neutral", color: "warning" },
          { label: "CV Score", value: "72%", change: "+8% improved", trend: "up", color: "accent" },
        ].map((stat, i) => (
          <div
            key={i}
            className={cn(
              "bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-fade-in-up group",
              `stagger-${i + 1}`,
            )}
            style={{ opacity: 0 }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.color === "primary" && "bg-primary/10 text-primary",
                  stat.color === "secondary" && "bg-secondary/10 text-secondary",
                  stat.color === "warning" && "bg-warning/10 text-warning",
                  stat.color === "accent" && "bg-accent/10 text-accent",
                )}
              >
                {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
            <p
              className={cn("text-xs mt-2 font-medium", stat.trend === "up" ? "text-accent" : "text-muted-foreground")}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <span className="text-xs text-muted-foreground">Choose an action to get started</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                "group relative bg-card border border-border rounded-xl p-5 hover:shadow-xl transition-all duration-300 overflow-hidden",
                "hover:border-transparent hover:-translate-y-1",
              )}
            >
              {/* Hover gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  action.bgColor,
                )}
              ></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                      action.gradient,
                    )}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4 text-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-base">{action.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recommended For You</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Based on your skills and preferences</p>
          </div>
          <Link
            to="/dashboard/opportunities"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Junior Web Developer", company: "TechCo SA", type: "Full-time", match: 92, posted: "2h ago" },
            {
              title: "Digital Marketing Learnership",
              company: "MediaHouse",
              type: "Learnership",
              match: 88,
              posted: "5h ago",
            },
            { title: "IT Support Internship", company: "FinServe", type: "Internship", match: 85, posted: "1d ago" },
          ].map((job, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-accent to-accent/80 text-white text-xs rounded-full font-semibold shadow-sm">
                    {job.match}% match
                  </span>
                  <span className="text-xs text-muted-foreground">{job.posted}</span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 bg-muted text-xs text-muted-foreground rounded-full font-medium">
                  {job.type}
                </span>
                <button className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  View details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DigitalTwinChatbot />
    </div>
  )
}