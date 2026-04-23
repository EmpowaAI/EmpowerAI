// pages/ForgotPassword.tsx

import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, Lock, Shield, Sparkles } from "lucide-react";
import { accountService } from "../../api/Index";
import Logo from "../../components/ui/Logo";
import ThemeToggle from "../../components/ui/ThemeToggle";
import backgroundImg from "../../assets/images/empowerlogin.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await accountService.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const leftPanel = (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
      <img
        src={backgroundImg}
        alt=""
        loading="eager"
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
      />
      <div className="absolute inset-0 panel-image-overlay" />
      <div className="absolute inset-0 panel-image-accent opacity-70" />

      <div className="relative z-10 animate-slide-up">
        <Logo variant="light" size="md" linkTo="/" />
      </div>
      <div className="relative z-10 max-w-lg space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-white drop-shadow-lg">
          Recover your account
        </h1>
        <ul className="space-y-4">
          {[
            { text: "Reset your password securely", icon: Lock },
            { text: "Protect your account", icon: Shield },
            { text: "Quick email recovery", icon: Mail },
            { text: "Safe authentication process", icon: Sparkles },
          ].map((item, i) => (
            <li
              key={item.text}
              className="flex animate-slide-up items-center gap-3 text-white drop-shadow-md"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <item.icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
              </div>
              <span className="text-base">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p
        className="relative z-10 max-w-sm animate-slide-up text-xs font-medium uppercase tracking-widest text-white/80 drop-shadow-md"
        style={{ animationDelay: "0.6s" }}
      >
        Youth Economic Digital Twin Platform
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col animate-fade-in bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-foreground sm:flex-row dark:from-background dark:via-background dark:to-muted/60">
      {leftPanel}

      <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="absolute right-4 top-4 z-30">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 md:p-9 dark:bg-card">
            <div className="mb-6 sm:mb-8 lg:hidden">
              <Logo variant="default" size="md" linkTo="/" />
            </div>

            {isSuccess ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-emerald-500/15 p-4 dark:bg-emerald-500/25">
                    <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Check your email</h2>
                <p className="text-muted-foreground">
                  We sent a password reset link to <strong className="text-foreground">{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">Didn&apos;t receive the email? Check your spam folder.</p>
                <Link
                  to="/reset-password"
                  className="inline-block w-full rounded-lg bg-primary px-4 py-2.5 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Enter reset code
                </Link>
                <div className="pt-1">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="mb-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Forgot password?
                  </h2>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    No worries, we&apos;ll send you reset instructions.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-foreground">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background py-3 pl-12 pr-4 text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Reset password"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
