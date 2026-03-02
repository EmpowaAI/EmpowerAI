import { useState, useEffect } from "react"
// Updated: Fixed page locking after twin generation
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
} from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../lib/user-context"
import ThemeToggle from "../components/ThemeToggle"
import Logo from "../components/Logo"

// Import Neural Fusion components for enhancement
import AIAvatar from "../components/ui/AIAvatar"
import NeuralLoading from "../components/ui/NeuralLoading"
import HolographicButton from "../components/ui/HolographicButton"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: User, label: "My Twin", path: "/dashboard/twin" },
  { icon: TrendingUp, label: "Simulations", path: "/dashboard/simulations" },
  { icon: Briefcase, label: "Opportunities", path: "/dashboard/opportunities" },
  { icon: FileText, label: "CV Analyzer", path: "/dashboard/cv-analyzer" },
  { icon: Mic, label: "Interview Coach", path: "/dashboard/interview-coach" },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const { user, logout, progress } = useUser()

  const isSubPage = location.pathname !== "/dashboard"
  const currentPage = navItems.find((item) => item.path === location.pathname)

  // No more progress checking - all logged-in users have full access
  useEffect(() => {
    // Just ensure loading state is cleared
    setIsChecking(false)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  // Show loading while checking - Enhanced with Neural Fusion
  if (isChecking) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <AIAvatar size="xl" variant="processing" />
          <NeuralLoading size="lg" text="Checking your progress..." />
          <p className="text-sm text-muted-foreground">Preparing your personalized experience</p>
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
      <div
        className={cn(
          "fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out",
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-md lg:backdrop-blur-0 lg:bg-card border-r border-border transform transition-all duration-300 ease-in-out lg:transform-none flex-shrink-0 shadow-2xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 flex items-center justify-between border-b border-border">
            <Logo variant="default" size="md" linkTo="/" />
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
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-white/20" : "bg-muted group-hover:bg-background"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                </Link>
              )
            })}
          </nav>

          {/* User Section - Enhanced with Neural Fusion */}
          <div className="p-3 border-t border-border space-y-2">
            <Link
              to="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
            >
              <AIAvatar size="md" variant="default" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md flex items-center px-4 md:px-6 gap-3 flex-shrink-0 sticky top-0 z-30">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground p-2 -ml-1 hover:bg-muted rounded-lg transition-colors active:scale-95"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {isSubPage && (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hover:bg-muted rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{currentPage?.label || "Dashboard"}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block truncate">Manage your career journey</p>
          </div>

          {/* Progress indicator and Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {progress.twinCompleted ? (
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-medium whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
                <span className="truncate">Score: {progress.empowermentScore || 0}/100</span>
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
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}