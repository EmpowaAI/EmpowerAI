// pages/ResetPassword.tsx

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, CheckCircle, Lock, Shield, Mail, Sparkles } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import Logo from "@/components/ui/Logo"
import loginBg from "@/assets/images/login-bg.png"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function ResetPassword() {
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true)
            }
        })
        // Also check if already in a recovery session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setReady(true)
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }
        setIsLoading(true)
        try {
            const { error: sbError } = await supabase.auth.updateUser({ password })
            if (sbError) throw new Error(sbError.message)
            setIsSuccess(true)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err: any) {
            setError(err.message || "Failed to reset password")
        } finally {
            setIsLoading(false)
        }
    }

return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex flex-col sm:flex-row animate-fade-in">

    {/* Left Panel */}
    <div
        className="hidden min-h-screen flex-1 flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
    >
        <div className="absolute inset-0 panel-image-overlay" />
        <div className="absolute inset-0 panel-image-accent opacity-70" />
        <div className="relative z-10 animate-slide-up">
            <Logo variant="light" size="md" linkTo="/" />
        </div>
        <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white drop-shadow-md">
              Set new password
            </p>
            <h1 className="font-display text-4xl font-bold text-white mb-6 drop-shadow-md">
                Set a new password
            </h1>
            <ul className="space-y-4">
                {[
                    { text: "Create a strong password", icon: Lock },
                    { text: "Secure your account", icon: Shield },
                    { text: "Easy recovery process", icon: Mail },
                    { text: "Enhanced protection", icon: Sparkles },
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
        <p className="relative z-10 max-w-sm text-xs font-medium uppercase tracking-widest text-white/60 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            Youth Economic Digital Twin Platform
        </p>
    </div>

    {/* Right Panel */}
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <div className="absolute top-4 right-4 z-20">
            <ThemeToggle />
        </div>
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="bg-card/80 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-7 md:p-9">
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
                    <h2 className="font-display text-2xl font-bold text-primary">Password reset!</h2>
                    <p className="text-muted-foreground">
                        Your password has been successfully reset. Redirecting to login...
                    </p>
                    <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                </div>
                ) : !ready ? (
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-sm">Verifying reset link…</p>
                    <p className="text-xs text-muted-foreground">
                        If this takes too long, your link may have expired. <a href="/forgot-password" className="text-primary hover:underline">Request a new one.</a>
                    </p>
                </div>
                ) : (
                <>
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full mb-4">
                            <Lock className="h-3 w-3 text-secondary" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Security Portal</span>
                        </div>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-tight">Reset password</h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Enter your new password below.
                        </p>
                    </div>
                    {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl text-destructive text-sm animate-fade-up">
                        {error}
                    </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground block">
                                New password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 border rounded-xl bg-background/50 border-border/60 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 transition-all text-foreground" placeholder="Enter new password" required disabled={isLoading} minLength={8}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground block">
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                                <input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 border rounded-xl bg-background/50 border-border/60 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 transition-all text-foreground" placeholder="Confirm new password" required disabled={isLoading} minLength={8}/>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="shimmer w-full py-4 bg-cta-gradient text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-cta hover:shadow-glow">
                            {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Resetting...
                            </>
                            ) : (
                            'Reset password'
                            )}
                        </button>
                    </form>
                </>
                )}
            </div>
        </div>
    </div>
    </div>
  )
}
