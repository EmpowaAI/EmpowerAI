// pages/SignupPage.tsx
import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Zap, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react"
import { authAPI } from "../lib/api"
import { useUser } from "../lib/user-context"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const navigate = useNavigate()
  const { setUser } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authAPI.register(formData)
      if (response.status === "success" && response.data?.user) {
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
          id: response.data.user.id || response.data.user._id,
          empowermentScore: response.data.user.empowermentScore,
        })
        // Redirect to CV Analyzer first
        navigate("/dashboard/cv-analyzer")
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex flex-1 bg-cover bg-center p-12 flex-col justify-between relative"
        style={{ backgroundImage: "url(/images/result.jpg)" }}
      >
        {/* Semi-transparent overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content with relative positioning to appear above overlay */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <img 
            src="/images/logo.jpeg" 
            alt="EmpowerAI Logo" 
            className="h-10 w-10 rounded-lg object-cover shadow-lg"
          />
          <span className="text-xl font-bold text-white drop-shadow-lg">EmpowerAI</span>
        </Link>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            Start your journey to economic empowerment
          </h1>
          <ul className="space-y-4">
            {[
              "Build your Digital Economic Twin",
              "Visualize your earning potential",
              "Get personalized career guidance",
              "Access SA-specific opportunities",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white drop-shadow-md">
                <CheckCircle className="h-5 w-5 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/90 relative z-10 drop-shadow-md">Youth Economic Digital Twin Platform</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img 
              src="/images/logo.jpeg" 
              alt="EmpowerAI Logo" 
              className="h-10 w-10 rounded-lg object-cover shadow-sm"
            />
            <span className="text-xl font-bold text-foreground">EmpowerAI</span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Create account</h2>
          <p className="text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12 transition-all"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 rounded border-border text-primary focus:ring-primary" required />
              <span className="text-sm text-muted-foreground">I agree to the Terms of Service and Privacy Policy</span>
            </label>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
