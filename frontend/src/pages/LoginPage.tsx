// pages/LoginPage.tsx
import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react"
import { authAPI } from "../lib/api"
import { useUser } from "../lib/user-context"
import { syncProgressFromBackend, unlockAllPages } from "../utils/progressSync"
import Logo from "../components/Logo"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, progress, updateProgress } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authAPI.login(email, password)
      if (response.status === "success" && response.data?.user) {
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
          id: response.data.user.id || response.data.user._id,
          empowermentScore: response.data.user.empowermentScore,
        })
        
        // Sync progress from backend to ensure accurate state
        try {
          const syncedProgress = await syncProgressFromBackend()
          
          // Update progress in context
          updateProgress('cvCompleted', syncedProgress.cvCompleted)
          updateProgress('twinCompleted', syncedProgress.twinCompleted)
          if (syncedProgress.empowermentScore) {
            updateProgress('empowermentScore', syncedProgress.empowermentScore)
          }
          
          // If user has completed everything, unlock all pages and go to dashboard
          if (syncedProgress.cvCompleted && syncedProgress.twinCompleted) {
            unlockAllPages(syncedProgress.empowermentScore || undefined)
            navigate("/dashboard", { replace: true })
          } else if (syncedProgress.cvCompleted) {
            // CV completed but twin not completed
            navigate("/dashboard/twin", { replace: true })
          } else {
            // Nothing completed, start with CV
            navigate("/dashboard/cv-analyzer", { replace: true })
          }
        } catch (error) {
          console.log('Error syncing progress, using local state:', error)
          // Fallback to local progress state
          if (!progress.cvCompleted) {
            navigate("/dashboard/cv-analyzer", { replace: true })
          } else if (!progress.twinCompleted) {
            navigate("/dashboard/twin", { replace: true })
          } else {
            unlockAllPages(progress.empowermentScore || undefined)
            navigate("/dashboard", { replace: true })
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col sm:flex-row">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/result.jpg)",
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />

        {/* Content with higher z-index */}
        <div className="relative z-10">
          <Logo variant="light" size="md" linkTo="/" />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Welcome back to your economic future</h1>
          <p className="text-white/90 text-lg drop-shadow-md">
            Continue building your path to success with AI-powered guidance.
          </p>
        </div>

        <p className="text-sm text-white/80 relative z-10 drop-shadow-md">Youth Economic Digital Twin Platform</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-5 sm:p-6 md:p-8">
          <div className="lg:hidden mb-6 sm:mb-8">
            <Logo variant="default" size="md" linkTo="/" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">Sign in</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 sm:py-3 bg-background border border-border rounded-lg text-base sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[52px]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 sm:py-3 bg-background border border-border rounded-lg text-base sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12 transition-all min-h-[52px]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary w-4 h-4" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-primary/80 hover:underline">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md min-h-[52px] text-base touch-manipulation"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
