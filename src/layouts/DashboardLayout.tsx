import { useState, useEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Zap,
  LayoutDashboard,
  User,
  TrendingUp,
  Briefcase,
  FileText,
  Mic,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Settings,
  Shield,
} from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../lib/user-context"
import ThemeToggle from "../components/ThemeToggle"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", locked: false },
  { icon: FileText, label: "CV Analyzer", path: "/dashboard/cv-analyzer", locked: false },
  { icon: User, label: "My Twin", path: "/dashboard/twin", locked: "cv" },
  { icon: TrendingUp, label: "Simulations", path: "/dashboard/simulations", locked: "twin" },
  { icon: Briefcase, label: "Opportunities", path: "/dashboard/opportunities", locked: "twin" },
  { icon: Mic, label: "Interview Coach", path: "/dashboard/interview-coach", locked: "twin" },
  { icon: Briefcase, label: "My Applications", path: "/dashboard/applications", locked: "twin" },
  ...(import.meta.env.VITE_ENABLE_ADMIN === "true"
    ? [{ icon: Shield, label: "Admin", path: "/dashboard/admin", locked: false }]
    : []),
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const { user, logout, progress } = useUser()

  const isSubPage = location.pathname !== "/dashboard"
  const currentPage = navItems.find((item) => item.path === location.pathname)

  // Check progress and redirect with proper loading state
  useEffect(() => {
    const checkProgressAndRedirect = async () => {
      setIsChecking(true)

      // Wait a bit to prevent immediate redirect flash
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Sync progress from localStorage to ensure it's up to date
      const cvCompleted = localStorage.getItem("cvCompleted") === "true"
      const twinCompleted = localStorage.getItem("twinCompleted") === "true"

      // Update progress if it's different from localStorage
      if (cvCompleted !== progress.cvCompleted || twinCompleted !== progress.twinCompleted) {
        // Progress will be synced by UserContext, just wait a tick
        await new Promise((resolve) => setTimeout(resolve, 50))
        setIsChecking(false)
        return
      }

      // Don't redirect if already on correct path
      const currentPath = location.pathname

      // Allow access to these paths regardless of progress
      const alwaysAllowed = [
        "/dashboard/cv-analyzer",
        "/dashboard",
        "/dashboard/twin",
        "/dashboard/profile",
        ...(import.meta.env.VITE_ENABLE_ADMIN === "true" ? ["/dashboard/admin"] : []),
      ]

      if (alwaysAllowed.includes(currentPath)) {
        setIsChecking(false)
        return
      }

      // Define allowed paths based on progress
      const allowedPaths = {
        "/dashboard/simulations": progress.cvCompleted && progress.twinCompleted,
        "/dashboard/opportunities": progress.cvCompleted && progress.twinCompleted,
        "/dashboard/interview-coach": progress.cvCompleted && progress.twinCompleted,
        "/dashboard/applications": progress.cvCompleted && progress.twinCompleted,
      }

      const isAllowed = allowedPaths[currentPath as keyof typeof allowedPaths] || false

      if (!isAllowed) {
        // Determine where to redirect
        if (!progress.cvCompleted) {
          navigate("/dashboard/cv-analyzer", { replace: true })
        } else if (!progress.twinCompleted) {
          navigate("/dashboard/twin", { replace: true })
        } else {
          navigate("/dashboard", { replace: true })
        }
      } else {
        setIsChecking(false)
      }
    }

    checkProgressAndRedirect()
  }, [location.pathname, progress, navigate])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const isLocked = (locked: string | boolean) => {
    if (locked === "cv") return !progress.cvCompleted
    if (locked === "twin") return !progress.cvCompleted || !progress.twinCompleted
    return false
  }

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto animate-pulse">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <p className="text-muted-foreground">Checking your progress...</p>
        </div>
      </div>
    )
  }

  const displayName = user?.name?.split(" ")[0] || "Guest"
  const displayEmail = user?.email || "guest@email.com"
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "GU"

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out",
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-in-out lg:transform-none flex-shrink-0 shadow-2xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                EmpowerAI
              </span>
            </Link>
            <button
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Navigation
            </p>
            {navItems.map((item) => {
              const locked = isLocked(item.locked)
              const active = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={locked ? "#" : item.path}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault()
                      if (!progress.cvCompleted) {
                        navigate("/dashboard/cv-analyzer")
                      } else if (!progress.twinCompleted) {
                        navigate("/dashboard/twin")
                      }
                    } else {
                      setSidebarOpen(false)
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : locked
                      ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 flex items-center justify-center",
                      active ? "text-white" : "text-current"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {locked && (
                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                      Locked
                    </span>
                  )}
                  {active && <ChevronRight className="w-4 h-4 opacity-50" />}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              to="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
              </div>
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {isSubPage && (
            <button
              onClick={() => {
                if (progress.cvCompleted && progress.twinCompleted) {
                  navigate("/dashboard")
                } else if (progress.cvCompleted) {
                  navigate("/dashboard/twin")
                } else {
                  navigate("/dashboard/cv-analyzer")
                }
              }}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
              {currentPage?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block truncate">Manage your career journey</p>
          </div>

          {/* Progress indicator and Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {progress.twinCompleted ? (
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Score: {progress.empowermentScore || 0}%
                </span>
              </div>
            ) : progress.cvCompleted ? (
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-medium whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse flex-shrink-0"></span>
                <span className="truncate">Complete Twin</span>
              </div>
            ) : (
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-medium whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse flex-shrink-0"></span>
                <span className="truncate">Start CV Analyzer</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900/50">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}