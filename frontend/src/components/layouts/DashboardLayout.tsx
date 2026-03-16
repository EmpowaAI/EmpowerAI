// src/components/DashboardLayout.tsx

import { useEffect, useState } from "react"
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom"
import {Menu,X,LogOut,ArrowLeft,Settings,Home,Brain,FileText,MessageSquare,Briefcase,} from "lucide-react"
import { cn } from "../../lib/utils"
import ThemeToggle from "../ui/ThemeToggle"
import Logo from "../../components/ui/Logo"
import { useUser } from "../../contexts/user-context"
import { authService } from "../../api/Index"
import { adminAPI } from "../../lib/api"
import toast from "react-hot-toast"

interface DashboardLayoutProps {
    children?: React.ReactNode
    progress?: {
    cvCompleted: boolean
    twinCompleted: boolean
    empowermentScore?: number
    }
}

export default function DashboardLayout({ 
    children, 
    progress = { cvCompleted: false, twinCompleted: false },
}: DashboardLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

const displayName = user?.name?.split(" ")[0] || "Guest"
const displayEmail = user?.email || "guest@email.com"
const initials = user?.name

? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2): "GU"

const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/dashboard/twin", label: "Digital Twin", icon: Brain },
    { path: "/dashboard/cv-analyzer", label: "CV Analyzer", icon: FileText },
    { path: "/dashboard/interview-coach", label: "Interview Coach", icon: MessageSquare },
    { path: "/dashboard/opportunities", label: "Opportunities", icon: Briefcase },
]

const ADMIN_KEY_STORAGE = "empowerai-admin-key"
const LAST_JOB_ID_STORAGE = "empowerai:last-ai-job-id"

const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
try {
    // Calls POST /api/auth/logout to invalidate session server-side,
    // then removes the local token via authService
    await authService.logout()
} catch {
    // Even if the server call fails, proceed with local cleanup
} finally {

// Clear all app-specific localStorage keys
localStorage.removeItem('twinData')
localStorage.removeItem('twinCreated')
localStorage.removeItem('comprehensiveCVAnalysis')
localStorage.removeItem('cvSkills')
localStorage.removeItem('cvFileName')
navigate('/', { replace: true })

}}

const [queueStatus, setQueueStatus] = useState<{
    enabled: boolean
    workerEnabled: boolean
    redisUrlSet: boolean
    counts?: {
        waiting?: number
        active?: number
        failed?: number
        delayed?: number
    } | null
} | null>(null)
const [queueUpdatedAt, setQueueUpdatedAt] = useState<string | null>(null)
const [queueModalOpen, setQueueModalOpen] = useState(false)
const [copyStatus, setCopyStatus] = useState<string | null>(null)
const [lastJobId, setLastJobId] = useState<string | null>(null)

const refreshQueueHealth = async (opts?: { silent?: boolean }) => {
    if (import.meta.env.VITE_ENABLE_ADMIN !== "true") return
    const adminKey = localStorage.getItem(ADMIN_KEY_STORAGE)
    if (!adminKey) return
    try {
        const response = await adminAPI.getQueueHealth(adminKey.trim())
        setQueueStatus(response.queue || null)
        setQueueUpdatedAt(new Date().toISOString())
    } catch {
        setQueueStatus(null)
        if (!opts?.silent) {
            toast.error("Failed to load queue health.")
        }
    }
}

const prefetchRoute = (path: string) => {
    switch (path) {
        case "/dashboard":
            void import("../../pages/Dashboard/Dashboard")
            return
        case "/dashboard/twin":
        case "/dashboard/twin-builder":
            void import("../../pages/Twin-builder/TwinBuilder")
            return
        case "/dashboard/cv-analyzer":
            void import("../../pages/CV-analysis/CVAnalyzer")
            return
        case "/dashboard/interview-coach":
            void import("../../pages/Interview/InterviewCoach")
            return
        case "/dashboard/opportunities":
            void import("../../pages/Oportunities/Opportunities")
            return
        case "/dashboard/simulations":
            void import("../../pages/Simulation/Simulations")
            return
        case "/dashboard/applications":
            void import("../../pages/Oportunities/Applications")
            return
        case "/dashboard/chat":
            void import("../../pages/AI/Chat")
            return
        case "/dashboard/profile":
            void import("../../pages/User/Profile")
            return
        default:
            return
    }
}

useEffect(() => {
    if (!queueModalOpen) return
    try {
        const stored = localStorage.getItem(LAST_JOB_ID_STORAGE)
        setLastJobId(stored)
    } catch {
        setLastJobId(null)
    }
}, [queueModalOpen, queueUpdatedAt])

const copyJobId = async () => {
    if (!lastJobId) {
        setCopyStatus("No job ID available yet.")
        setTimeout(() => setCopyStatus(null), 2000)
        return
    }
    try {
        await navigator.clipboard.writeText(String(lastJobId))
        setCopyStatus("Job ID copied.")
        setTimeout(() => setCopyStatus(null), 2000)
    } catch {
        setCopyStatus("Failed to copy.")
        setTimeout(() => setCopyStatus(null), 2000)
    }
}

useEffect(() => {
    let cancelled = false
    let intervalId: number | null = null

    const load = async () => {
        if (cancelled) return
        await refreshQueueHealth({ silent: true })
    }

    load()
    intervalId = window.setInterval(load, 30000)

    return () => {
        cancelled = true
        if (intervalId) window.clearInterval(intervalId)
    }
}, [])

return (
<>
<div className="min-h-[100dvh] bg-background flex overflow-hidden">

{/* Mobile Menu Overlay */}
<div className={cn("fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 transition-all duration-300 ease-in-out",mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible")}
    onClick={() => setMobileMenuOpen(false)}
    aria-hidden={!mobileMenuOpen}
/>

{/* Mobile Menu */}
<div className={cn("fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-all duration-300 ease-in-out shadow-2xl",mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
    <div className="flex flex-col h-full">

        {/* Mobile Menu Header */}
        <div className="p-6 flex items-center justify-between border-b border-border">
            <Logo size="md" linkTo="/dashboard" />
            <button className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}>
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
                        onMouseEnter={() => prefetchRoute(item.path)}
                        onFocus={() => prefetchRoute(item.path)}
                        className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all",isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                    );
                })
                }
            </div>
        </div>

        {/* Mobile User Section */}
        <div className="p-4 border-t border-border space-y-2">
        <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
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
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-all cursor-pointer" type="button">
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
            <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
            </button>

        {/* Logo - Visible on desktop */}
            <Logo size="md" linkTo="/dashboard" className="hidden lg:flex" />
        {/* Back button for subpages */}
        {isSubPage && (
            <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hover:bg-muted rounded-lg">
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
                        onMouseEnter={() => prefetchRoute(item.path)}
                        onFocus={() => prefetchRoute(item.path)}
                        className={cn( "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all", isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                    );
                })}
            </nav>

        <div className="flex items-center gap-2">
        {/* Desktop User Info - Now Clickable */}
            <Link to="/dashboard/profile" className="hidden md:flex items-center gap-3 mr-2 hover:bg-muted p-2 rounded-xl transition-colors group">
                <div className="text-right">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[var(--sa-terracotta)] flex items-center justify-center text-primary-foreground font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                    {initials}
                </div>
            </Link>

        {/* Desktop Sign Out Button */}
        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border border-transparent hover:border-destructive/20" title="Sign Out" type="button">
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">Sign Out</span>
        </button>

        {/* Progress indicator */}
        {progress.twinCompleted ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--sa-green)]/10 rounded-full border border-[var(--sa-green)]/30">
                <span className="w-2 h-2 bg-[var(--sa-green)] rounded-full animate-pulse" />
                <span className="text-xs font-bold text-[var(--sa-green)]">
                    Score: {progress.empowermentScore || 0}%
                </span>
            </div>
        ) : progress.cvCompleted ? (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--sa-gold)]/10 text-[var(--sa-gold)] rounded-full text-xs font-medium whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-[var(--sa-gold)] animate-pulse flex-shrink-0"></span>
            <span className="truncate">Complete Digital Twin</span>
        </div>
        ) : (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--sa-gold)]/10 text-[var(--sa-gold)] rounded-full text-xs font-medium whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-[var(--sa-gold)] animate-pulse flex-shrink-0"></span>
            <span className="truncate">Start CV Analyzer</span>
        </div>
        )}
        {queueStatus && (
            <button
            type="button"
            onClick={() => setQueueModalOpen(true)}
            className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border",
                queueStatus.enabled && queueStatus.workerEnabled
                    ? "bg-[var(--sa-green)]/10 text-[var(--sa-green)] border-[var(--sa-green)]/30"
                    : "bg-[var(--sa-gold)]/10 text-[var(--sa-gold)] border-[var(--sa-gold)]/30"
            )}
            aria-label="View AI queue status"
            >
                <span className={cn(
                    "h-2 w-2 rounded-full animate-pulse flex-shrink-0",
                    queueStatus.enabled && queueStatus.workerEnabled
                        ? "bg-[var(--sa-green)]"
                        : "bg-[var(--sa-gold)]"
                )}></span>
                <span className="truncate">
                    Queue {queueStatus.enabled ? "On" : "Off"}
                    {queueStatus.counts?.failed ? ` • Failed ${queueStatus.counts.failed}` : ""}
                </span>
            </button>
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
                                onTouchStart={() => prefetchRoute(item.path)}
                                className={cn("flex flex-col items-center justify-center rounded-lg py-2 text-[10px] font-medium transition-colors", isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                                <Icon className="h-4 w-4 mb-1" />
                                <span className="truncate max-w-[56px]">{item.label.split(" ")[0]}</span>
                            </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>
        </div>
        {queueModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
                    onClick={() => setQueueModalOpen(false)}
                    aria-hidden="true"
                />
                <div className="relative w-[92%] max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">AI Queue Status</h3>
                            <p className="text-xs text-muted-foreground">Live snapshot of background jobs.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setQueueModalOpen(false)}
                            className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3">
                        <div className="rounded-xl border border-border p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                            <p className="text-sm text-foreground">
                                {queueStatus?.enabled ? "Enabled" : "Disabled"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Worker: {queueStatus?.workerEnabled ? "On" : "Off"} • Redis: {queueStatus?.redisUrlSet ? "Set" : "Missing"}
                            </p>
                        </div>
                        <div className="rounded-xl border border-border p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Jobs</p>
                            {queueStatus?.counts ? (
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <span>Waiting: {queueStatus.counts.waiting ?? 0}</span>
                                    <span>Active: {queueStatus.counts.active ?? 0}</span>
                                    <span>Failed: {queueStatus.counts.failed ?? 0}</span>
                                    <span>Delayed: {queueStatus.counts.delayed ?? 0}</span>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">No queue data available.</p>
                            )}
                            {queueUpdatedAt && (
                                <p className="mt-2 text-[11px] text-muted-foreground">
                                    Updated {new Date(queueUpdatedAt).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                        <div className="rounded-xl border border-border p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Job ID</p>
                            <p className="mt-1 text-xs font-mono text-foreground break-all">
                                {lastJobId || "No job ID captured yet."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={copyJobId}
                            className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                            Copy Job ID
                        </button>
                        <button
                            type="button"
                            onClick={() => refreshQueueHealth()}
                            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                            Refresh
                        </button>
                    </div>
                    {copyStatus && (
                        <p className="mt-2 text-[11px] text-muted-foreground">{copyStatus}</p>
                    )}
                </div>
            </div>
        )}
</>
)}
