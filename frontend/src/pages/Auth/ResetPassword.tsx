// pages/ResetPassword.tsx
import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, Lock, Shield, Mail, Sparkles, ArrowLeft } from "lucide-react";
import { accountService } from "@/api/Index";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import background from "@/assets/images/result.jpg";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      setError("Invalid reset link");
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!token) {
      setError("Invalid reset token");
      return;
    }
    setIsLoading(true);
    try {
      await accountService.resetPassword({ token, newPassword: password, confirmPassword });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const leftPanel = (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
      <img
        src={background}
        alt="EmpowaAI"
        loading="eager"
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center crisp-image"
      />
      <div className="absolute inset-0 panel-image-overlay" />
      <div className="absolute inset-0 panel-image-accent opacity-70" />

      <div className="relative z-10 max-w-lg space-y-6 animate-slide-up">
        <Logo variant="light" size="lg" linkTo="/" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
          Password Reset
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-md">
          Set a new password for your account.
        </h1>
        <ul className="space-y-4">
          {[
            { text: "Create a strong password", icon: Lock },
            { text: "Secure your account", icon: Shield },
            { text: "Easy recovery process", icon: Mail },
            { text: "Enhanced protection", icon: Sparkles },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-white panel-copy-shadow animate-slide-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="h-8 w-8 rounded-lg bg-ai-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
                <item.icon className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p
        className="relative z-10 max-w-sm text-xs font-medium uppercase tracking-widest text-white/60 animate-slide-up"
        style={{ animationDelay: "0.6s" }}
      >
        Youth Economic Digital Twin Platform
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-foreground sm:flex-row dark:from-background dark:via-background dark:to-muted/60"
    >
      {leftPanel}

      <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="absolute right-4 top-4 z-30">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 md:p-9 dark:bg-card">
            <div className="lg:hidden mb-6 sm:mb-8">
              <Logo variant="default" size="md" linkTo="/" />
            </div>

            {isSuccess ? (
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-ai-gradient flex items-center justify-center animate-glow-pulse shadow-glow">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                    Password reset!
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Your password has been successfully reset.
                  </p>
                </div>
                <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Redirecting to login...</span>
                  </p>
                </div>
                <Button asChild variant="cta" size="lg" className="w-full shimmer">
                  <Link to="/login">Go to Login</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full mb-4">
                    <Lock className="h-3 w-3 text-secondary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                      Security Portal
                    </span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-tight">
                    Reset password
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Enter your new password below.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl text-sm text-destructive animate-slide-up">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password Field */}
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <label
                      className={`auth-floating-label ${
                        passwordFocused || password
                          ? "auth-floating-label-shrink text-secondary font-bold"
                          : "text-sm text-muted-foreground"
                      }`}
                    >
                      New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      autoComplete="new-password"
                      className={`min-h-[52px] w-full rounded-xl border py-3.5 pl-12 pr-12 text-base text-foreground transition-all ${
                        passwordFocused
                          ? "border-secondary/50 bg-background ring-2 ring-secondary/10"
                          : "border-border/60 bg-background"
                      }`}
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-primary/10 rounded-lg"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                    <label
                      className={`auth-floating-label ${
                        confirmFocused || confirmPassword
                          ? "auth-floating-label-shrink text-secondary font-bold"
                          : "text-sm text-muted-foreground"
                      }`}
                    >
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setConfirmFocused(true)}
                      onBlur={() => setConfirmFocused(false)}
                      autoComplete="new-password"
                      className={`min-h-[52px] w-full rounded-xl border py-3.5 pl-12 pr-4 text-base text-foreground transition-all ${
                        confirmFocused
                          ? "border-secondary/50 bg-background ring-2 ring-secondary/10"
                          : "border-border/60 bg-background"
                      }`}
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-2 animate-slide-up">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              password.length >= level * 2
                                ? level <= 2
                                  ? "bg-destructive"
                                  : level === 3
                                    ? "bg-secondary"
                                    : "bg-emerald-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {password.length < 4 ? "Too weak" : password.length < 6 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !token}
                    variant="cta"
                    size="lg"
                    className="w-full shimmer min-h-[56px] text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset password</span>
                        <Sparkles className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center pt-6 border-t border-border/50">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
