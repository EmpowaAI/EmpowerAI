// pages/ForgotPassword.tsx
import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Mail, CheckCircle, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react"
import { accountService } from "../../api/Index"
import Logo from "../../components/Logo"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await accountService.forgotPassword(email)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col sm:flex-row animate-fade-in">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url(/images/result.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-transparent to-cyan-600/20 opacity-50" />

        <div className="relative z-10 animate-slide-up">
          <Logo variant="light" size="md" linkTo="/" />
        </div>

        <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            {isSuccess ? "Check your inbox" : "Recover your account"}
          </h1>
          <ul className="space-y-4">
            {[
              { text: "Reset your password securely", icon: CheckCircle },
              { text: "Protect your account", icon: CheckCircle },
              { text: "Quick email recovery", icon: CheckCircle },
              { text: "Safe authentication process", icon: CheckCircle },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white drop-shadow-md animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="text-base">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/80 relative z-10 drop-shadow-md animate-slide-up" style={{ animationDelay: '0.6s' }}>
          Youth Economic Digital Twin Platform
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="bg-card/80 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-7 md:p-9 hover:shadow-3xl transition-all duration-300">

            <div className="lg:hidden mb-6 sm:mb-8">
              <Logo variant="default" size="md" linkTo="/" />
            </div>

            {isSuccess ? (
              /* ── Success Screen ── */
              <div className="text-center">

                {/* Animated icon */}
                <div className="relative mx-auto mb-6 w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-950/60 animate-pulse" />
                  <div className="relative flex items-center justify-center w-full h-full">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Mail className="h-9 w-9 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-md border-2 border-card">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                  Check your inbox
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base mb-6">
                  We've sent a password reset link to
                </p>

                {/* Email pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-full mb-8">
                  <Mail className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 truncate max-w-[240px]">
                    {email}
                  </span>
                </div>

                {/* Steps */}
                <div className="text-left space-y-3 mb-8 bg-muted/40 rounded-xl p-4">
                  {[
                    "Open the email we just sent you",
                    "Click the reset password link inside",
                    "Choose a new secure password",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                      <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/login"
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 min-h-[56px] text-base group mb-4"
                >
                  <span>Back to login</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Resend hint */}
                <p className="text-xs text-muted-foreground">
                  Didn't receive it?{" "}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try again
                  </button>
                  {" "}or check your spam folder.
                </p>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="mb-8">
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Forgot password?</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No worries, we'll send you reset instructions.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl text-sm text-destructive animate-slide-up">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField || email ? 'text-xs -top-2.5 bg-card px-2 text-primary' : 'top-4 text-base text-muted-foreground'}`}>
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField(true)}
                      onBlur={() => setFocusedField(false)}
                      className={`w-full px-4 py-4 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${focusedField ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-border/80'}`}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 min-h-[56px] text-base touch-manipulation"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      "Send reset instructions"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to login
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
