// pages/Auth/ConfirmEmail.tsx

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { accountService } from "../../api/Index"
import Logo from "../../components/ui/Logo"

export default function ConfirmEmail() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const confirm = async () => {
        const token = searchParams.get('token')
        if (!token) {
            setError('No confirmation token provided')
            setIsLoading(false)
        return
        }
    try {
        await accountService.confirmEmailChange(token)
        setIsSuccess(true)
        setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
        setError(err.message || "Email confirmation failed")
    } finally {
    setIsLoading(false)
    }
}
confirm()
}, [searchParams, navigate])

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
                    <h2 className="text-2xl font-bold text-foreground">Confirming your new email...</h2>
                    <p className="text-muted-foreground">Please wait while we update your email address.</p>
                </div>
            )}

            {!isLoading && isSuccess && (
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Email updated!</h2>
                        <p className="text-muted-foreground">Your email address has been successfully updated.</p>
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Redirecting you to login in a few seconds...</p>
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
                        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                            <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Confirmation failed</h2>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">The link may be invalid or expired. Try requesting an email change again from your profile.</p>
                    <Link to="/dashboard/profile" className="inline-block w-full text-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                        Back to Profile
                    </Link>
                </div>
                )}
            </div>
        </div>
    </div>
    )
}
