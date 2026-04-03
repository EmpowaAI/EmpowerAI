
// pages/LoginPage.tsx - Enhanced with beautiful animations
import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import toast from 'react-hot-toast';
import { authAPI } from "../../lib/api";
import { useUser } from "../../contexts/user-context";
import { syncProgressFromBackend, unlockAllPages } from "../../utils/progressSync";
import Logo from "../../components/ui/Logo";
import ThemeToggle from "../../components/ui/ThemeToggle";
import loginBg from "../../assets/images/empowerlogin.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warmupHint, setWarmupHint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const navigate = useNavigate();
  const { setUser, progress, updateProgress } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setWarmupHint("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      if (response.status === "success" && response.data?.user) {
        setUser({
          name: response.data.user.name,
          email: response.data.user.email,
          id: response.data.user.id || response.data.user._id,
          empowermentScore: response.data.user.empowermentScore,
        });
        
        toast.success(`Welcome back, ${response.data.user.name}!`);
        
        // Sync progress from backend to ensure accurate state
        try {
          const syncedProgress = await syncProgressFromBackend();
          
          // Update progress in context
          updateProgress('cvCompleted', syncedProgress.cvCompleted);
          updateProgress('twinCompleted', syncedProgress.twinCompleted);
          if (syncedProgress.empowermentScore) {
            updateProgress('empowermentScore', syncedProgress.empowermentScore);
          }
          
          // If user has completed everything, unlock all pages and go to dashboard
          if (syncedProgress.cvCompleted && syncedProgress.twinCompleted) {
            unlockAllPages(syncedProgress.empowermentScore || undefined);
            navigate("/dashboard", { replace: true });
          } else if (syncedProgress.cvCompleted) {
            // CV completed but twin not completed
            navigate("/dashboard/twin", { replace: true });
          } else {
            // Nothing completed, start with CV
            navigate("/dashboard/cv-analyzer", { replace: true });
          }
        } catch (error) {
          console.log('Error syncing progress, using local state:', error);
          // Fallback to local progress state
          if (!progress.cvCompleted) {
            navigate("/dashboard/cv-analyzer", { replace: true });
          } else if (!progress.twinCompleted) {
            navigate("/dashboard/twin", { replace: true });
          } else {
            unlockAllPages(progress.empowermentScore || undefined);
            navigate("/dashboard", { replace: true });
          }
        }
      }
    } catch (err: any) {
      if (err?.isTimeout) {
        setWarmupHint("The server may be waking up. Please wait a few seconds and try again.");
      }
      const errorMessage = err.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const leftPanel = (
    <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
      <img
        src={loginBg}
        alt="EmpowaAI"
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-center crisp-image"
      />
      <div className="absolute inset-0 panel-image-overlay" />
      <div className="absolute inset-0 panel-image-accent opacity-70" />

      <div className="relative z-10 max-w-lg space-y-6 animate-slide-up">
        <Logo variant="light" size="lg" linkTo="/" />
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80 panel-copy-shadow">
          Welcome back
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white panel-copy-shadow">
          Continue your journey to economic empowerment.
        </h1>
        <ul className="space-y-4">
          {[
            { text: "Access your Digital Economic Twin", icon: Sparkles },
            { text: "Track your earning potential", icon: Eye },
            { text: "Continue personalized career guidance", icon: Loader2 },
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-white panel-copy-shadow animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <item.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-base">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 max-w-sm text-sm text-white/80 panel-copy-shadow animate-slide-up" style={{ animationDelay: "0.6s" }}>
        Youth Economic Digital Twin Platform
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex flex-col sm:flex-row animate-fade-in">
      {leftPanel}

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="auth-card-surface p-6 sm:p-7 md:p-9 transition-all duration-300">
            <div className="lg:hidden mb-6 sm:mb-8">
              <Logo variant="default" size="md" linkTo="/" />
            </div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Secure Login</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Sign in</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {warmupHint && (
                <div className="p-4 bg-sky-500/10 border-2 border-sky-500/30 rounded-xl text-sm text-sky-700 animate-slide-up">
                  {warmupHint}
                </div>
              )}
              
              {/* Email Input with floating effect */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    emailFocused || email
                      ? "text-xs -top-2.5 bg-card px-2 text-primary"
                      : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  className={`w-full px-4 py-4 border rounded-xl text-base text-foreground transition-all min-h-[56px] auth-input ${
                    emailFocused 
                      ? "border-primary/40" 
                      : "border-border/60 hover:border-border/70"
                  }`}
                  required
                />
              </div>

              {/* Password Input with floating effect */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    passwordFocused || password
                      ? "text-xs -top-2.5 bg-card px-2 text-primary"
                      : "top-4 text-base text-muted-foreground"
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoComplete="current-password"
                  className={`w-full px-4 py-4 pr-12 border rounded-xl text-base text-foreground transition-all min-h-[56px] auth-input ${
                    passwordFocused 
                      ? "border-primary/40" 
                      : "border-border/60 hover:border-border/70"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-background auth-icon-button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4 transition-all cursor-pointer" 
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 hover:underline font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 min-h-[56px] text-base group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
