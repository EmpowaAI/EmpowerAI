// pages/ForgotPassword.tsx

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Mail, CheckCircle } from "lucide-react"
import { accountService } from "../../api/Index"
import Logo from "../../components/ui/Logo"
import backgroud from "../../assets/images/empowerlogin.png"

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex flex-col sm:flex-row animate-fade-in">
    {/* Left Panel */}
        <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{ backgroundImage: `url(${backgroud})` }}/>
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-transparent to-cyan-600/20 opacity-50" />
                <div className="relative z-10 animate-slide-up">
                    <Logo variant="light" size="md" linkTo="/" />
                </div>
                <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                        Recover your account
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
                        <div className="text-center space-y-6">
                        <div className="flex justify-center">
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                            <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
                    <p className="text-muted-foreground">
                        We sent a password reset link to <strong className="text-foreground">{email}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Didn't receive the email? Check your spam folder.
                    </p>
                    <Link to="/reset-password" className="inline-block w-full text-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                        Enter reset code
                    </Link>
                    <div className="pt-1">
                        <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            ) : (
            <>
            <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Forgot password?</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                    No worries, we'll send you reset instructions.
                </p>
            </div>
            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground block">
                        Email address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground" placeholder="Enter your email" required disabled={isLoading}/>
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
                    {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                    </>
                    ) : (
                    'Reset password'
                    )}
                </button>
            </form>
            <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors">
                    ← Back to Login
                </Link>
                </div>
                </>
                )}
            </div>
        </div>
    </div>
</div>

)}
