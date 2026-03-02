import type React from "react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, TrendingUp, Users, ShieldCheck } from "lucide-react"
import { authAPI, getToken } from "../lib/api"
import { useUser } from "../lib/user-context"
import Logo from "../components/Logo"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useUser()

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!canSubmit) return

    setIsLoading(true)

    try {
      const response = await authAPI.login(email.trim(), password)
      const token = getToken()

      if (!token) {
        setError("Login failed: no authentication token returned. Please try again.")
        return
      }

      if (response.status === "success" && response.data?.user) {
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
          id: response.data.user.id || response.data.user._id,
          empowermentScore: response.data.user.empowermentScore,
        })
        navigate("/dashboard", { replace: true })
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col lg:flex-row animate-fade-in">
      <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url(/images/result.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 opacity-60" />

        <div className="relative z-10 animate-slide-up">
          <Logo variant="light" size="md" linkTo="/" />
        </div>

        <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Welcome back to your economic future</h1>
          <p className="text-white/90 text-lg drop-shadow-md">
            Continue your personalized AI-guided journey to opportunities, better decisions, and growth.
          </p>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="inline-flex items-center gap-2 text-white/90">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">Trusted by 10,000+ youth</span>
            </div>
            <div className="inline-flex items-center gap-2 text-white/90">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium">Real-time career recommendations</span>
            </div>
            <div className="inline-flex items-center gap-2 text-white/90">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-medium">Secure account and data protection</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/80 relative z-10 drop-shadow-md animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Youth Economic Digital Twin Platform
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="bg-card/85 dark:bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl p-6 sm:p-7 md:p-9 transition-all duration-300">
            <div className="lg:hidden mb-6 sm:mb-8">
              <Logo variant="default" size="md" linkTo="/" />
            </div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">Secure Login</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Sign in</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
                  Create one
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    emailFocused || email ? "text-xs -top-2.5 bg-card px-2 text-primary" : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`w-full px-4 py-4 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    emailFocused ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-border/80"
                  }`}
                  required
                />
              </div>

              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    passwordFocused || password ? "text-xs -top-2.5 bg-card px-2 text-primary" : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`w-full px-4 py-4 pr-12 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    passwordFocused ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-border/80"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-background"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" className="rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive animate-slide-up">
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
                disabled={isLoading || !canSubmit}
                className="w-full py-4 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-100 min-h-[56px] touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
