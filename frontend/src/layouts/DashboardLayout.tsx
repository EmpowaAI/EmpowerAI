// src/components/DashboardLayout.tsx
import { useEffect, useState } from "react"
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom"
import {
  Zap,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  Settings,
  Home,
  Brain,
  FileText,
  MessageSquare,
  Briefcase,
} from "lucide-react"
import { cn } from "../lib/utils"
import ThemeToggle from "../components/ThemeToggle"
import { useUser } from "../lib/user-context" // Add this import

interface DashboardLayoutProps {
  children?: React.ReactNode
  progress?: {
    cvCompleted: boolean
    twinCompleted: boolean
    empowermentScore?: number
  }
  // Remove user prop - we'll get it from context
}

export default function DashboardLayout({ 
  children, 
  progress = { cvCompleted: false, twinCompleted: false },
}: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Get user from context
  const { user } = useUser()

  const isSubPage = pathname !== "/dashboard"

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Use user from context, with fallback
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

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/dashboard/twin", label: "Digital Twin", icon: Brain },
    { path: "/dashboard/cv-analyzer", label: "CV Analyzer", icon: FileText },
    { path: "/dashboard/interview-coach", label: "Interview Coach", icon: MessageSquare },
    { path: "/dashboard/opportunities", label: "Opportunities", icon: Briefcase },
  ]

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Logout button clicked")
    
    // Clear any authentication data from localStorage
    localStorage.removeItem('empowerai-token')
    localStorage.removeItem('twinData')
    localStorage.removeItem('twinCreated')
    localStorage.removeItem('comprehensiveCVAnalysis')
    localStorage.removeItem('cvSkills')
    localStorage.removeItem('cvFileName')
    
    // Navigate to landing page
    navigate('/', { replace: true })
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-all duration-300 ease-in-out shadow-2xl",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="p-6 flex items-center justify-between border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                EmpowerAI
              </span>
            </Link>
            <button
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile User Section */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              to="/dashboard/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[var(--sa-terracotta)] flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
              type="button"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo - Visible on desktop */}
            <Link to="/dashboard" className="hidden lg:flex items-center gap-2 group">
              <div className="p-1.5 bg-primary rounded-lg shadow-lg shadow-primary/20">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-black tracking-tight text-foreground">
                EmpowerAI
              </span>
            </Link>

            {/* Back button for subpages */}
            {isSubPage && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hover:bg-muted rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">Back to Dashboard</span>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Desktop User Info - Now Clickable */}
            <Link
              to="/dashboard/profile"
              className="hidden md:flex items-center gap-3 mr-2 hover:bg-muted p-2 rounded-xl transition-colors group"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayEmail}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[var(--sa-terracotta)] flex items-center justify-center text-primary-foreground font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                {initials}
              </div>
            </Link>

            {/* Desktop Sign Out Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border border-transparent hover:border-destructive/20"
              title="Sign Out"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>

            {/* Progress indicator */}
            {progress.twinCompleted ? (
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-[var(--sa-green)]/10 rounded-full border border-[var(--sa-green)]/30">
                <span className="w-2 h-2 bg-[var(--sa-green)] rounded-full animate-pulse" />
                <span className="text-xs font-bold text-[var(--sa-green)]">
                  Score: {progress.empowermentScore || 0}%
                </span>
              </div>
            ) : progress.cvCompleted ? (
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-[var(--sa-gold)]/10 text-[var(--sa-gold)] rounded-full text-xs font-medium whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-[var(--sa-gold)] animate-pulse flex-shrink-0"></span>
                <span className="truncate">Complete Digital Twin</span>
              </div>
            ) : (
              <div className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-[var(--sa-gold)]/10 text-[var(--sa-gold)] rounded-full text-xs font-medium whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-[var(--sa-gold)] animate-pulse flex-shrink-0"></span>
                <span className="truncate">Start CV Analyzer</span>
              </div>
            )}

            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/30">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-24 lg:pb-10 max-w-6xl mx-auto w-full">
            {children || <Outlet />}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-md">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={`bottom-${item.path}`}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg py-2 text-[10px] font-medium transition-colors",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="truncate max-w-[56px]">{item.label.split(" ")[0]}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
