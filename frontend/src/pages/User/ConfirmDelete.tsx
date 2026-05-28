// pages/User/ConfirmDelete.tsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle, AlertTriangle, Home, User } from "lucide-react";
import { accountService } from "@/api/Index";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function ConfirmDelete() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirm = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setError("No confirmation token provided");
        setIsLoading(false);
        return;
      }
      try {
        await accountService.confirmAccountDeletion(token);
        setIsSuccess(true);
      } catch (err: any) {
        setError(err.message || "Account deletion failed");
      } finally {
        setIsLoading(false);
      }
    };
    confirm();
  }, [searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 text-foreground dark:from-background dark:via-background dark:to-muted/60"
    >
      <div className="absolute right-4 top-4 z-30">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl sm:p-10 dark:bg-card">
          <div className="mb-8 flex justify-center">
            <Logo variant="default" size="md" linkTo="/" />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Deleting your account...
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Please wait while we permanently delete your account.
                </p>
              </div>
            </div>
          )}

          {!isLoading && isSuccess && (
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="h-20 w-20 rounded-full bg-ai-gradient flex items-center justify-center animate-glow-pulse shadow-glow">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Account deleted
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Your account has been permanently deleted. We&apos;re sorry to see you go.
                </p>
              </div>
              <div className="w-full p-4 bg-muted/50 border border-border rounded-xl text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                  <span>All your data has been removed from our systems.</span>
                </p>
              </div>
              <Button asChild variant="cta" size="lg" className="w-full shimmer">
                <Link to="/">
                  <Home className="h-5 w-5" /> Back to Home
                </Link>
              </Button>
            </div>
          )}

          {!isLoading && !isSuccess && error && (
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Deletion failed
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">{error}</p>
              </div>
              <div className="w-full p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>The link may be invalid or expired. You can request a new deletion confirmation from your profile.</span>
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button asChild variant="cta" size="lg" className="flex-1 shimmer">
                  <Link to="/dashboard/profile">
                    <User className="h-5 w-5" /> Back to Profile
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link to="/">
                    <Home className="h-5 w-5" /> Home
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
