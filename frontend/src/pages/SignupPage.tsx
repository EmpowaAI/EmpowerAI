import type React from "react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, CheckCircle, Loader2, Shield, Zap } from "lucide-react"
import { authAPI } from "../lib/api"
import Logo from "../components/Logo"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const navigate = useNavigate()

  const passwordStrength = useMemo(() => {
    const p = formData.password
    if (p.length < 6) return { label: "Too weak", score: 1 }
    if (p.length < 8) return { label: "Could be stronger", score: 2 }
    const hasLetters = /[A-Za-z]/.test(p)
    const hasNumber = /\d/.test(p)
    const hasSymbol = /[^A-Za-z0-9]/.test(p)
    const bonus = Number(hasLetters) + Number(hasNumber) + Number(hasSymbol)
    if (bonus >= 3) return { label: "Strong", score: 4 }
    return { label: "Good", score: 3 }
  }, [formData.password])

  const passwordsMatch = formData.confirmPassword.length === 0 || formData.password === formData.confirmPassword

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length > 1 &&
      formData.email.trim().length > 3 &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      acceptTerms
    )
  }, [formData, acceptTerms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passwordsMatch) {
      setError("Passwords do not match.")
      return
    }

    if (!acceptTerms) {
      setError("Please accept the terms to continue.")
      return
    }

    if (!canSubmit) return

    setIsLoading(true)

    try {
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })
      if (response.status === "success") {
        setSuccess(true)
        setTimeout(() => navigate("/login"), 3000)
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card text-card-foreground border border-border rounded-2xl shadow-2xl p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We&apos;ve sent a verification link to <strong className="text-foreground">{formData.email}</strong>.
            </p>
            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col lg:flex-row animate-fade-in">
      <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url(/images/result.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 via-transparent to-accent/20 opacity-60" />

        <div className="relative z-10 animate-slide-up">
          <Logo variant="light" size="md" linkTo="/" />
        </div>

        <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Start your journey to empowerment</h1>
          <ul className="space-y-3 text-white/90">
            {["Build your Digital Economic Twin", "Discover SA-specific opportunities", "Track your growth with AI insights"].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
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
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">Secure Signup</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Create account</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    focusedField === "name" || formData.name ? "text-xs -top-2.5 bg-card px-2 text-primary" : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    focusedField === "name" ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-border/80"
                  }`}
                  required
                />
              </div>

              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    focusedField === "email" || formData.email ? "text-xs -top-2.5 bg-card px-2 text-primary" : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    focusedField === "email" ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-border/80"
                  }`}
                  required
                />
              </div>

              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    focusedField === "password" || formData.password ? "text-xs -top-2.5 bg-card px-2 text-primary" : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 pr-12 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    focusedField === "password" ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-border/80"
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

              {formData.password && (
                <div className="space-y-2 animate-slide-up">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 rounded-full flex-1 transition-all ${
                          passwordStrength.score >= level
                            ? level <= 2
                              ? "bg-warning"
                              : level === 3
                              ? "bg-primary"
                              : "bg-accent"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Password strength: {passwordStrength.label}
                  </p>
                </div>
              )}

              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    focusedField === "confirmPassword" || formData.confirmPassword ? "text-xs -top-2.5 bg-card px-2 text-primary" : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 pr-12 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${
                    focusedField === "confirmPassword"
                      ? "border-primary shadow-lg shadow-primary/10"
                      : !passwordsMatch
                      ? "border-destructive"
                      : "border-border hover:border-border/80"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-background"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {!passwordsMatch && (
                  <p className="mt-2 text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </span>
              </label>

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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
