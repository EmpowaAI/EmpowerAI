// pages/User/ConfirmEmail.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle, Mail, ArrowRight } from "lucide-react";
import { accountService } from "@/api/Index";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
        await accountService.confirmEmailChange(token);
        setIsSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: any) {
        setError(err.message || "Email confirmation failed");
      } finally {
        setIsLoading(false);
      }
    };
    confirm();
  }, [searchParams, navigate]);

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
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Confirming your new email...
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Please wait while we update your email address.
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
                  Email updated!
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Your email address has been successfully updated.
                </p>
              </div>
              <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-muted-foreground">
                <p className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Redirecting to login...</span>
                </p>
              </div>
              <Button asChild variant="cta" size="lg" className="w-full shimmer">
                <Link to="/login">
                  Go to Login <ArrowRight className="h-5 w-5" />
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
                  Confirmation failed
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">{error}</p>
              </div>
              <div className="w-full p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>The link may be invalid or expired. Try requesting an email change again from your profile.</span>
                </p>
              </div>
              <Button asChild variant="cta" size="lg" className="w-full shimmer">
                <Link to="/dashboard/profile">Back to Profile</Link>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
