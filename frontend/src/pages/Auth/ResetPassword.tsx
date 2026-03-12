// pages/ResetPassword.tsx

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, Loader2, CheckCircle, Lock } from "lucide-react"
import { accountService } from "../../api/Index"
import Logo from "../../components/ui/Logo"
import backgroud from "../../assets/images/result.jpg"

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const resetToken = searchParams.get('token')
        if (!resetToken) {
            setError('Invalid reset link')
        } else {
            setToken(resetToken)
        }
    }, [searchParams])

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
        if (!token) {
            setError("Invalid reset token")
            return
        }
        setIsLoading(true)
        try {
        // resetPassword takes { token, newPassword, confirmPassword } — if it doesn't throw, it succeeded
            await accountService.resetPassword({ token, newPassword: password, confirmPassword })
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
    <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{ backgroundImage: `url(${backgroud})` }}/>
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-transparent to-cyan-600/20 opacity-50" />
                    <div className="relative z-10 animate-slide-up">
                        <Logo variant="light" size="md" linkTo="/" />
                    </div>
                    <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                            Set a new password
                        </h1>
                        <ul className="space-y-4">
                            {[
                                { text: "Create a strong password", icon: Lock },
                                { text: "Secure your account", icon: CheckCircle },
                                { text: "Easy recovery process", icon: CheckCircle },
                                { text: "Enhanced protection", icon: CheckCircle },
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
                                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Password reset!</h2>
                                <p className="text-muted-foreground">
                                    Your password has been successfully reset. Redirecting to login...
                                </p>
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            </div>
                            ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Reset password</h2>
                                    <p className="text-sm sm:text-base text-muted-foreground">
                                        Enter your new password below.
                                    </p>
                                </div>
                                {error && (
                                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
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
                                                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground" placeholder="Enter new password" required disabled={isLoading} minLength={8}/>
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
                                        <input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground" placeholder="Confirm new password" required disabled={isLoading} minLength={8}/>
                                    </div>
                                </div>
                            <button type="submit" disabled={isLoading || !token} className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
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
)}
