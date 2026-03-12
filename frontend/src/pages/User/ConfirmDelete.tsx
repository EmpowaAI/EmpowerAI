// pages/Auth/ConfirmDelete.tsx

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { accountService } from "../../api/Index"
import Logo from "../../components/ui/Logo"

export default function ConfirmDelete() {
    const [searchParams] = useSearchParams()
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
            // accountService.confirmAccountDeletion also calls removeToken()
            await accountService.confirmAccountDeletion(token)
            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message || "Account deletion failed")
        } finally {
            setIsLoading(false)
        }
    }
    confirm()
    }, [searchParams])

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
                <h2 className="text-2xl font-bold text-foreground">Deleting your account...</h2>
                <p className="text-muted-foreground">Please wait while we permanently delete your account.</p>
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Account deleted</h2>
                    <p className="text-muted-foreground">Your account has been permanently deleted. We're sorry to see you go.</p>
                </div>
                <Link to="/" className="inline-block w-full text-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                    Back to Home
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Deletion failed</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <p className="text-sm text-muted-foreground">The link may be invalid or expired. You can request a new deletion confirmation from your profile.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/dashboard/profile" className="flex-1 text-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                        Back to Profile
                    </Link>
                    <Link to="/" className="flex-1 text-center px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-semibold">
                        Home
                    </Link>
                </div>
            </div>
            )}
        </div>
    </div>
</div>
)
}
