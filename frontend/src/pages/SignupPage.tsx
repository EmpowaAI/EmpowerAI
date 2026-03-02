import { useState, FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { authAPI } from "../lib/api"
import Logo from "../components/Logo"
import { cn } from "../lib/utils"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.register({ name, email, password })
      if (response.status === "success") {
        setSuccess(true)
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="premium-card p-8 text-center premium-animate-scale">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#10b981]" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">Check your email!</h2>
            <p className="premium-body mb-6">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and verify your account.
            </p>
            <p className="premium-body-small">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center py-12">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #d4d4d4 1px, transparent 1px), linear-gradient(to bottom, #d4d4d4 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
          }}
        />
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Signup Card */}
      <div className="w-full max-w-md px-6 premium-animate-in">
        <div className="premium-card p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo variant="dark" size="xl" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">Create your account</h1>
            <p className="premium-body-small">Start your journey to economic empowerment</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#fee2e2] dark:bg-[#7f1d1d] border border-[#fecaca] dark:border-[#991b1b] flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#991b1b] dark:text-[#fecaca]">{error}</p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#0a0a0a] dark:text-[#fafafa]">
                Full name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="premium-input pl-11"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-[#0a0a0a] dark:text-[#fafafa]">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="premium-input pl-11"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-[#0a0a0a] dark:text-[#fafafa]">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="premium-input pl-11 pr-11"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-[#737373]">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-[#0a0a0a] dark:text-[#fafafa]">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="premium-input pl-11"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-[#d4d4d4] dark:border-[#525252] text-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 mt-0.5"
                />
                <span className="text-sm text-[#525252] dark:text-[#a3a3a3]">
                  I agree to the{" "}
                  <a href="#" className="font-medium text-[#2563eb] hover:text-[#1e40af] transition-colors">
                    Terms of Service
                  </a>
                  {" "}and{" "}
                  <a href="#" className="font-medium text-[#2563eb] hover:text-[#1e40af] transition-colors">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "premium-btn premium-btn-primary w-full",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="premium-divider" />

          {/* Login Link */}
          <div className="text-center">
            <p className="premium-body-small">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[#2563eb] hover:text-[#1e40af] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#a3a3a3] flex items-center justify-center gap-2">
            <Lock className="h-3 w-3" />
            Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  )
}
