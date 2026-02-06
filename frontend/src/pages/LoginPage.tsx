// pages/LoginPage.tsx - Enhanced with beautiful animations
import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Zap, Eye, EyeOff, Loader2, Sparkles, TrendingUp, Users } from "lucide-react"
import toast from 'react-hot-toast'
import { authAPI } from "../lib/api"
import { useUser } from "../lib/user-context"
import { syncProgressFromBackend, unlockAllPages } from "../utils/progressSync"
import Logo from "../components/Logo"
import LoadingButton from "../components/LoadingButton"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
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
        
        toast.success(`Welcome back, ${response.data.user.name}!`)
        
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
      const errorMessage = err.message || "Login failed. Please check your credentials."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col sm:flex-row animate-fade-in">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: "url(/images/result.jpg)",
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />

        {/* Animated gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 opacity-50" />

        {/* Content with higher z-index */}
        <div className="relative z-10 animate-slide-up">
          <Logo variant="light" size="md" linkTo="/" />
        </div>

        <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Welcome back to your economic future</h1>
          <p className="text-white/90 text-lg drop-shadow-md">
            Continue building your path to success with AI-powered guidance.
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-white/90">
              <Users className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/80 relative z-10 drop-shadow-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Youth Economic Digital Twin Platform
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="bg-card/80 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-7 md:p-9 hover:shadow-3xl transition-all duration-300">
            <div className="lg:hidden mb-6 sm:mb-8">
              <Logo variant="default" size="md" linkTo="/" />
            </div>

            {/* Header with gradient accent */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 dark:bg-primary/10 rounded-full mb-4">
                <Sparkles className="h-3.5 w-3.5 text-primary dark:text-primary" />
                <span className="text-xs font-semibold text-primary dark:text-primary">Secure Login</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Sign in</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input with floating effect */}
              <div className="relative">
                <label 
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    emailFocused || email ? 'text-xs -top-2.5 bg-card px-2 text-primary' : 'top-4 text-base text-muted-foreground'
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`w-full px-4 py-4 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    emailFocused ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-border/80'
                  }`}
                  required
                />
              </div>

              {/* Password Input with floating effect */}
              <div className="relative">
                <label 
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    passwordFocused || password ? 'text-xs -top-2.5 bg-card px-2 text-primary' : 'top-4 text-base text-muted-foreground'
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`w-full px-4 py-4 pr-12 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    passwordFocused ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-border/80'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-background"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4 transition-all cursor-pointer" 
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                  Forgot password?
                </a>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl text-sm text-destructive animate-slide-up">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary/80 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 min-h-[56px] text-base touch-manipulation group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


