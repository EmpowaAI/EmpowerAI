"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Zap, Eye, EyeOff, CheckCircle } from "lucide-react"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/dashboard/twin")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Updated gradient colors */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-secondary/10 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">EmpowerAI</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-6">Start your journey to economic empowerment</h1>
          <ul className="space-y-4">
            {[
              "Build your Digital Economic Twin",
              "Visualize your earning potential",
              "Get personalized career guidance",
              "Access SA-specific opportunities",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">Youth Economic Digital Twin Platform</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">EmpowerAI</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Create account</h2>
          <p className="text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
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
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-12"
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
              <input type="checkbox" className="rounded border-border bg-background mt-1" required />
              <span className="text-sm text-muted-foreground">I agree to the Terms of Service and Privacy Policy</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
