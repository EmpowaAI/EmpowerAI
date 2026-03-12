// pages/SignupPage.tsx - Enhanced with beautiful animations

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, CheckCircle, Loader2, Sparkles, Shield, Zap, XCircle, Mail } from "lucide-react"
import toast from 'react-hot-toast'
import { authService } from "../../api/Index"
import Logo from "../../components/ui/Logo"
import background from "../../assets/images/empowersignin.jpg"


export default function SignupPage() {

const [showPassword, setShowPassword] = useState(false)
const [error, setError] = useState("")
const [isLoading, setIsLoading] = useState(false)
const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    })

const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    })

const [focusedField, setFocusedField] = useState<string | null>(null)


// Real-time validation

const validateField = (field: string, value: string) => {
    let error = ""
    switch (field) {
        case "name":
        if (!value.trim()) {
            error = "Name is required"
        } else if (value.trim().length < 2) {
            error = "Name must be at least 2 characters"
        }
    break

        case "email":
        if (!value.trim()) {
            error = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = "Please enter a valid email address"    
        }
    break
    case "password":
    if (!value) {
        error = "Password is required"
    } else if (value.length < 6) {
        error = "Password must be at least 6 characters"
    }
    break
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }))
    return error === ""

}

const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Only validate if field has been touched (user started typing)
    if (value.length > 0 || fieldErrors[field as keyof typeof fieldErrors]) {
        validateField(field, value)
    }
}

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate all fields
    const nameValid = validateField("name", formData.name)
    const emailValid = validateField("email", formData.email)
    const passwordValid = validateField("password", formData.password)
    if (!nameValid || !emailValid || !passwordValid) {
        toast.error("Please fix the errors before submitting")
        return
    }
    setIsLoading(true)
    try {
        const response = await authService.register(formData)
        // Registration successful — no token yet, email verification required
        setRegisteredEmail(formData.email)
        toast.success(`Account created! Check your inbox, ${response.user?.name ?? formData.name}.`)
    } catch (err: any) {
    const errorMessage = err.message || "Registration failed. Please try again."
    setError(errorMessage)
    toast.error(errorMessage)
    } finally {
        setIsLoading(false)
    }
}


// ─────────────────────────────────────────────
// Success screen — shown after successful registration
// ─────────────────────────────────────────────

if (registeredEmail) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex flex-col sm:flex-row animate-fade-in">
        {/* Left Panel */}
            <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{ backgroundImage: `url(${background})` }}/>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
                        <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 via-transparent to-secondary/20 opacity-50" />
                            <div className="relative z-10 animate-slide-up">
                                <Logo variant="light" size="md" linkTo="/" />
                            </div>
                            <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                                Start your journey to economic empowerment
                            </h1>
                            <ul className="space-y-4">
                                {[
                                    { text: "Build your Digital Economic Twin", icon: Sparkles },
                                    { text: "Visualize your earning potential", icon: Zap },
                                    { text: "Get personalized career guidance", icon: CheckCircle },
                                    { text: "Access SA-specific opportunities", icon: Shield },
                                ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white drop-shadow-md animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                                    <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                        <item.icon className="h-4 w-4 text-secondary" />
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
        
                    {/* Right Panel - Success */}
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
                        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <div className="bg-card/80 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-7 md:p-9 hover:shadow-3xl transition-all duration-300">
                                <div className="lg:hidden mb-6 sm:mb-8">
                                    <Logo variant="default" size="md" linkTo="/" />
                                </div>
                                <div className="flex flex-col items-center text-center space-y-6">
                                {/* Icon */}
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-slide-up">
                                    <Mail className="h-10 w-10 text-primary" />
                                </div>
                                {/* Heading */}
                                <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                        Check your email
                                    </h2>
                                    <p className="text-muted-foreground text-sm sm:text-base">
                                        We sent a verification link to
                                    </p>
                                    <p className="font-semibold text-foreground text-sm sm:text-base break-all">
                                        {registeredEmail}
                                    </p>
                                </div>
                                {/* Instructions */}
                                <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-muted-foreground text-left space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                    <p className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span>Open the email and click the verification link.</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span>The link will expire after 24 hours.</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span>Check your spam folder if you don't see it.</span>
                                    </p>
                                </div>
                                {/* Sign in link */}
                                <p className="text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                    Already verified?{" "}
                                    <Link to="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )
        }


// ─────────────────────────────────────────────
// Registration form
// ─────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex flex-col sm:flex-row animate-fade-in">
        {/* Left Panel */}
            <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
            {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" style={{ backgroundImage: `url(${background})` }}/>
                {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
                    {/* Animated gradient accent */}
                    <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 via-transparent to-secondary/20 opacity-50" />
                    {/* Content with higher z-index */}
                    <div className="relative z-10 animate-slide-up">
                        <Logo variant="light" size="md" linkTo="/" />
                    </div>
                    <div className="relative z-10 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                            Start your journey to economic empowerment
                        </h1>
                        <ul className="space-y-4">
                            {[
                                { text: "Build your Digital Economic Twin", icon: Sparkles },
                                { text: "Visualize your earning potential", icon: Zap },
                                { text: "Get personalized career guidance", icon: CheckCircle },
                                { text: "Access SA-specific opportunities", icon: Shield },
                            ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-white drop-shadow-md animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                                <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                    <item.icon className="h-4 w-4 text-secondary" />
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
                {/* Right Panel - Form */}
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
                        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <div className="bg-card/80 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 sm:p-7 md:p-9 hover:shadow-3xl transition-all duration-300">
                                <div className="lg:hidden mb-6 sm:mb-8">
                                    <Logo variant="default" size="md" linkTo="/" />
                                </div>
                                {/* Header with gradient accent */}
                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 dark:bg-primary/10 rounded-full mb-4">
                                        <Shield className="h-3.5 w-3.5 text-primary" />
                                        <span className="text-xs font-semibold text-primary">Free Account</span>
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
                                {/* Name Input with floating effect */}
                                    <div className="relative">
                                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${ focusedField === 'name' || formData.name ? 'text-xs -top-2.5 bg-card px-2' : 'top-4 text-base text-muted-foreground'} ${fieldErrors.name ? 'text-destructive' : focusedField === 'name' ? 'text-primary' : ''}`}>
                                            Full Name
                                        </label>
                                        <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} className={`w-full px-4 py-4 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${fieldErrors.name ? 'border-destructive' : focusedField === 'name' ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-border/80'}`} required />
                                        {fieldErrors.name && (
                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-destructive animate-slide-up">
                                            <XCircle className="h-3.5 w-3.5" />
                                            <span>{fieldErrors.name}</span>
                                        </div>
                                    )}
                                    </div>
                                    {/* Email Input with floating effect */}
                                    <div className="relative">
                                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'email' || formData.email ? 'text-xs -top-2.5 bg-card px-2' : 'top-4 text-base text-muted-foreground'} ${fieldErrors.email ? 'text-destructive' : focusedField === 'email' ? 'text-primary' : ''}`}>
                                            Email Address
                                        </label>
                                        <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className={`w-full px-4 py-4 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${ fieldErrors.email ? 'border-destructive' : focusedField === 'email' ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-border/80'}`} required />
                                        {fieldErrors.email && (
                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-destructive animate-slide-up">
                                            <XCircle className="h-3.5 w-3.5" />
                                            <span>{fieldErrors.email}</span>
                                        </div>
                                        )}
                                    </div>
                                    {/* Password Input with floating effect */}
                                    <div className="relative">
                                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'password' || formData.password ? 'text-xs -top-2.5 bg-card px-2' : 'top-4 text-base text-muted-foreground'} ${fieldErrors.password ? 'text-destructive' : focusedField === 'password' ? 'text-primary' : ''}`}>
                                            Password
                                        </label>
                                        <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className={`w-full px-4 py-4 pr-12 bg-background border-2 rounded-xl text-base text-foreground focus:outline-none transition-all min-h-[56px] ${ fieldErrors.password ? 'border-destructive' : focusedField === 'password' ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-border/80'}`} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-background">
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                        {fieldErrors.password && (
                                            <div className="flex items-center gap-1 mt-1.5 text-xs text-destructive animate-slide-up">
                                                <XCircle className="h-3.5 w-3.5" />
                                                <span>{fieldErrors.password}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Password strength indicator */}
                                    {formData.password && (
                                        <div className="space-y-2 animate-slide-up">
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4].map((level) => (
                                                <div key={level} className={`h-1.5 rounded-full flex-1 transition-all ${formData.password.length >= level * 2 ? level <= 2 ? 'bg-red-500': level === 3 ? 'bg-yellow-500': 'bg-accent': 'bg-slate-200 dark:bg-slate-700'}`}/>
                                                    ))}
                                                </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formData.password.length < 6 ? 'Password too weak': formData.password.length < 8 ? 'Password could be stronger': 'Strong password'}
                                                    </p>
                                                </div>
                                                )}
                                                <label className="flex items-start gap-2.5 cursor-pointer group pt-2">
                                                    <input type="checkbox" className="mt-1 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4 flex-shrink-0 cursor-pointer transition-all" required />
                                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                                        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                                                    </span>
                                                </label>
                                                {error && (
                                                <div className="p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl text-sm text-destructive animate-slide-up">
                                                    <div className="flex items-start gap-2">
                                                        <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    <span>{error}</span>
                                                </div>
                                            </div>
                                        )}
                                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary/80 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 min-h-[56px] text-base touch-manipulation group">
                                        {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Creating account...</span>
                                        </>
                                        ) : (
                                        <>
                                            <span>Create account</span>
                                            <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                        </>
                                    )}
                                </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )

}
