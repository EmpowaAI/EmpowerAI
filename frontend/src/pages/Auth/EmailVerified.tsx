// pages/EmailVerified.tsx

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { accountService } from "@/api/Index"
import Logo from "@/components/ui/Logo"

const VERIFY_TIMEOUT_MS = 20000

export default function EmailVerified() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let cancelled = false
        const verifyEmail = async () => {
        const token = searchParams.get('token')
        if (!token) {
            setError('No verification token provided')
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        setError("")
        try {
            // Race the API call against a hard timeout so the spinner can
            // never run forever on a hung request.
            await Promise.race([
                accountService.verifyEmail(token),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Verification is taking too long. Please try again.')), VERIFY_TIMEOUT_MS)
                ),
            ])
            if (cancelled) return
            setIsSuccess(true)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err: any) {
            if (cancelled) return
            setError(err.message || "Verification failed")
        } finally {
            if (!cancelled) setIsLoading(false)
        }
    }
        verifyEmail()
        return () => { cancelled = true }
    }, [searchParams, navigate, attempt])

return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md">
            <div className="bg-card/80 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 sm:p-10 text-center animate-slide-up">
                <div className="mb-6">
                    <Logo variant="default" size="md" linkTo="/" className="mx-auto" />
                </div>
                {isLoading && (
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Verifying your email...</h2>
                        <p className="text-muted-foreground">
                            Please wait while we verify your account.
                        </p>
                    </div>
                    )}

                    {!isLoading && isSuccess && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="bg-success/10 dark:bg-success/30 p-4 rounded-full">
                                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Email verified!</h2>
                            <p className="text-muted-foreground">
                                Your account has been successfully verified.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Redirecting you to login in a few seconds...
                            </p>
                            <div className="flex justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        </div>
                        <Link to="/login" className="inline-block w-full text-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                            Go to Login
                        </Link>
                    </div>
                )}
                {!isLoading && !isSuccess && error && (
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-destructive/10 dark:bg-destructive/30 p-4 rounded-full">
                            <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Verification failed</h2>
                    <p className="text-muted-foreground">
                        {error}
                    </p>
                </div>
                <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    The verification link may be invalid or expired.
                </p>
                <button
                    onClick={() => setAttempt(n => n + 1)}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                    Try again
                </button>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/signup" className="flex-1 text-center px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold">
                        Sign up again
                    </Link>
                    <Link to="/login" className="flex-1 text-center px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-semibold">
                        Go to Login
                    </Link>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
