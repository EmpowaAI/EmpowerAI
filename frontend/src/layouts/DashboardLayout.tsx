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
} from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../lib/user-context"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: User, label: "My Twin", path: "/dashboard/twin" },
  { icon: TrendingUp, label: "Simulations", path: "/dashboard/simulations" },
  { icon: Briefcase, label: "Opportunities", path: "/dashboard/opportunities" },
  { icon: FileText, label: "CV Analyzer", path: "/dashboard/cv-analyzer" },
  { icon: Mic, label: "Interview Coach", path: "/dashboard/interview" },
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
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Don't redirect if already on correct path
      const currentPath = location.pathname
      
      // Allow access to these paths regardless of progress
      const alwaysAllowed = [
        "/dashboard/cv-analyzer",
        "/dashboard",
        "/dashboard/twin"
      ]
      
      if (alwaysAllowed.includes(currentPath)) {
        setIsChecking(false)
        return
      }
      
      // Define allowed paths based on progress
      const allowedPaths = {
        "/dashboard/simulations": progress.cvCompleted && progress.twinCompleted,
        "/dashboard/opportunities": progress.cvCompleted && progress.twinCompleted,
        "/dashboard/interview": progress.cvCompleted && progress.twinCompleted,
      }
      
      const isAllowed = allowedPaths[currentPath] || false
      
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
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-all duration-300 ease-out lg:transform-none flex-shrink-0 shadow-xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 flex items-center justify-between border-b border-border">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                EmpowerAI
              </span>
            </Link>
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path
              const isDisabled = !progress.cvCompleted || !progress.twinCompleted
              
              // Determine if item should be disabled
              const shouldDisable = !(
                item.path === "/dashboard/cv-analyzer" ||
                (item.path === "/dashboard/twin" && progress.cvCompleted) ||
                (progress.cvCompleted && progress.twinCompleted)
              )
              
              return (
                <Link
                  key={item.path}
                  to={shouldDisable ? "#" : item.path}
                  onClick={(e) => {
                    if (shouldDisable) {
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
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    shouldDisable && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-white/20" : "bg-muted group-hover:bg-background",
                      shouldDisable && "group-hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {shouldDisable && !isActive && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Locked</span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-sm font-semibold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 md:px-6 gap-4 flex-shrink-0 sticky top-0 z-30">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
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
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hover:bg-muted rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
          )}

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{currentPage?.label || "Dashboard"}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Manage your career journey</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            {progress.twinCompleted ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                Score: {progress.empowermentScore || 0}/100
              </div>
            ) : progress.cvCompleted ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse"></span>
                Complete Twin Builder
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse"></span>
                Start with CV Analyzer
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/30">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}