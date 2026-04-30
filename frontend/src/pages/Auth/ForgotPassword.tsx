// pages/ForgotPassword.tsx

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Mail, CheckCircle, Lock, Shield, Sparkles, ArrowLeft } from "lucide-react"
import { accountService } from "@/api/Index"
import Logo from "@/components/ui/Logo"
import background from "@/assets/images/empowerlogin.png"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)
            try {
            // forgotPassword returns { message } — no status field, if it doesn't throw it succeeded
                await accountService.forgotPassword({ email })
                setIsSuccess(true)
            } catch (err: any) {
                setError(err.message || "Something went wrong")
            } finally {
                setIsLoading(false)
            }
        }

return (
    <div className="ai-mesh ai-spotlight grain min-h-screen bg-background text-foreground flex flex-col sm:flex-row animate-fade-in relative overflow-hidden">
      <div className="ai-grid absolute inset-0 opacity-40 pointer-events-none" />
      
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
        <img src={background} alt="Background" className="absolute inset-0 h-full w-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background/90" />
        <div className="ai-grid absolute inset-0 opacity-30" />
        
        <div className="relative z-10 animate-slide-up">
          <Logo variant="light" size="md" linkTo="/" />
        </div>
        
        <div className="relative z-10 space-y-6 animate-slide-up max-w-lg" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
            Account Recovery
          </p>
          <h1 className="font-display text-4xl font-bold text-white mb-6 drop-shadow-md">
            Recover your account
          </h1>
          <ul className="space-y-4">
            {[
              { text: "Recover your password securely", icon: Lock },
              { text: "Protect your account", icon: Shield },
              { text: "Quick email recovery", icon: Mail },
              { text: "Safe authentication process", icon: Sparkles },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white drop-shadow-md animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="h-8 w-8 rounded-lg bg-ai-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
                  <item.icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 max-w-sm text-xs font-medium uppercase tracking-widest text-white/60 animate-slide-up" style={{ animationDelay: "0.6s" }}>
          Youth Economic Digital Twin Platform
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md animate-scale-in" style={{ animationDelay: '0.15s' }}>
          <div className="card-glow bg-card/40 backdrop-blur-xl border border-border/50 p-6 sm:p-7 md:p-9 rounded-2xl shadow-card-soft">
            <div className="lg:hidden mb-6 sm:mb-8">
              <Logo variant="default" size="md" linkTo="/" />
            </div>

            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-ai-gradient flex items-center justify-center animate-glow-pulse shadow-glow">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold text-primary">Check your email</h2>
                <p className="text-muted-foreground">
                  We sent a password reset link to <strong className="text-foreground">{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder.
                </p>
                <Link to="/reset-password" title="Code entry" className="shimmer inline-block w-full text-center px-4 py-3 bg-cta-gradient text-white rounded-xl font-bold shadow-cta hover:shadow-glow transition-all">
                  Enter reset code
                </Link>
                <div className="pt-1">
                  <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors flex items-center justify-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full mb-4">
                    <Lock className="h-3 w-3 text-secondary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Security Portal</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-tight">Forgot password?</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No worries, we'll send you reset instructions.
                  </p>
                </div>
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl text-destructive text-sm animate-fade-up">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 border rounded-xl bg-background/50 border-border/60 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 transition-all text-foreground" placeholder="Email address" required disabled={isLoading}/>
                  </div>
                  <button type="submit" disabled={isLoading} className="shimmer w-full py-4 bg-cta-gradient text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-cta hover:shadow-glow">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Reset password'
                    )}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors flex items-center justify-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
