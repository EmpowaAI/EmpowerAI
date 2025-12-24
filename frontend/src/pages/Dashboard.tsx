import DigitalTwinChatbot from "../components/DigitalTwinChatbot";
import { Link } from "react-router-dom"
import { TrendingUp, Target, Briefcase, FileText, Mic, ArrowRight, Zap, Sparkles, ChevronUp, Clock } from "lucide-react"
import { useUser } from "../lib/user-context"
import { cn } from "../lib/utils"

export default function Dashboard() {
  const { user } = useUser()
  const displayName = user?.name?.split(" ")[0] || "there"

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-indigo-600 dark:bg-indigo-700 rounded-xl p-6 md:p-8 shadow-lg">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium text-white flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> AI-Powered
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Welcome back, {displayName}!</h1>
            <p className="text-indigo-100 text-sm md:text-base max-w-md">
              Your economic twin is ready. Let's build your future today.
            </p>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <div className="text-center p-4 bg-white/10 rounded-lg border border-white/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-3xl font-bold text-white">78</p>
                <ChevronUp className="h-5 w-5 text-emerald-300" />
              </div>
              <p className="text-xs text-indigo-100">Empowerment Score</p>
            </div>
            <div className="h-16 w-px bg-white/20"></div>
            <div className="text-center p-4 bg-white/10 rounded-lg border border-white/20">
              <p className="text-3xl font-bold text-white">R4.2K</p>
              <p className="text-xs text-indigo-100">3-Month Projection</p>
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
              "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 group"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
                  stat.color === "primary" && "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
                  stat.color === "secondary" && "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
                  stat.color === "warning" && "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                  stat.color === "accent" && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
                )}
              >
                {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{stat.value}</p>
            <p
              className={cn("text-sm font-medium", stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">Choose an action to get started</span>
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
                "group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
                    i === 0 && "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
                    i === 1 && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
                    i === 2 && "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
                    i === 3 && "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
                    i === 4 && "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
                    i === 5 && "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
                  )}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">{action.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recommended For You</h2>
            <p className="text-sm text-slate-500 mt-1">Based on your skills and preferences</p>
          </div>
          <Link
            to="/dashboard/opportunities"
            className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors group"
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
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-semibold">
                    {job.match}% match
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{job.posted}</span>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">{job.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{job.company}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-full font-medium">
                  {job.type}
                </span>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
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