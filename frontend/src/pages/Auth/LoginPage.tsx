/**
 * LoginPage.tsx - Synchronized with Neural Fusion (v2) Design System + Footer
 */
import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Eye, EyeOff, Loader2, Sparkles, Mail, Lock, Home, 
  Facebook, Instagram, Linkedin, MapPin, Shield, FileText, Cookie, X 
} from "lucide-react";
import toast from 'react-hot-toast';
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/user-context";
import { syncProgressFromBackend, unlockAllPages } from "@/utils/progressSync";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ContactWidget } from "@/components/ContactWidget";
import TikTokIcon from "@/components/ui/TikTokIcon";
import loginBg from "@/assets/images/login-bg.png";

// Modal Component
function Modal({ isOpen, onClose, title, icon: Icon, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  icon: any;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-2xl w-full max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-display font-bold text-primary">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 max-h-[calc(85vh-70px)]">
          {children}
        </div>
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-3 flex justify-end">
          <Button variant="outline" onClick={onClose} size="sm">Close</Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Modal states
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, progress, updateProgress } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);

      // Store access token immediately so API calls in this handler work
      localStorage.setItem('empowerai-token', authData.session.access_token);

      // Fetch full profile from backend (Supabase user only has email/id)
      const { API_BASE_URL: apiBase } = await import('@/lib/apiBase');
      const validateRes = await fetch(`${apiBase}/auth/validate`, {
        headers: { 'Authorization': `Bearer ${authData.session.access_token}` }
      });
      if (!validateRes.ok) throw new Error('Failed to load your profile. Please try again.');
      const validateData = await validateRes.json();
      const backendUser = validateData.data?.user;

      if (backendUser) {
        const savedProfileImage = localStorage.getItem('profile_image');
        setUser({
          name: backendUser.name,
          email: backendUser.email,
          id: backendUser.id,
          empowermentScore: backendUser.empowermentScore || 0,
          profileImage: backendUser.avatar || backendUser.profileImage || savedProfileImage || undefined
        });
        toast.success(`Welcome back, ${backendUser.name}!`);
      }

      const intendedPath = (location.state as { from?: Location })?.from?.pathname;
      const from = intendedPath?.startsWith('/dashboard') ? intendedPath : null;

      try {
        const syncedProgress = await syncProgressFromBackend();
        updateProgress('cvCompleted', syncedProgress.cvCompleted);
        updateProgress('twinCompleted', syncedProgress.twinCompleted);
        if (syncedProgress.empowermentScore) {
          updateProgress('empowermentScore', syncedProgress.empowermentScore);
        }

        if (from) {
          navigate(from, { replace: true });
        } else if (syncedProgress.cvCompleted && syncedProgress.twinCompleted) {
          unlockAllPages(syncedProgress.empowermentScore || 0);
          navigate("/dashboard", { replace: true });
        } else if (syncedProgress.cvCompleted) {
          navigate("/dashboard/twin", { replace: true });
        } else {
          navigate("/dashboard/cv-analyzer", { replace: true });
        }
      } catch {
        if (from) {
          navigate(from, { replace: true });
        } else if (!progress.cvCompleted) {
          navigate("/dashboard/cv-analyzer", { replace: true });
        } else if (!progress.twinCompleted) {
          navigate("/dashboard/twin", { replace: true });
        } else {
          unlockAllPages(progress.empowermentScore || 0);
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const leftPanel = (
    <div
      className="relative hidden min-h-screen flex-1 flex-col justify-between overflow-hidden p-12 lg:flex"
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
    >
      <div className="absolute inset-0 panel-image-overlay" />
      <div className="absolute inset-0 panel-image-accent opacity-70" />

      <div className="relative z-10 max-w-lg space-y-6 animate-slide-up">
        <Logo variant="light" size="lg" linkTo="/" />
        <p className="text-2xl font-semibold uppercase tracking-[0.24em] text-white drop-shadow-md">
          Welcome back
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-md">
          Continue your journey to economic empowerment.
        </h1>
        <ul className="space-y-4">
          {[
            { text: "Access your Digital Economic Twin", icon: Sparkles },
            { text: "Track your earning potential", icon: Eye },
            { text: "Continue personalized career guidance", icon: Loader2 },
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-white panel-copy-shadow animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="h-8 w-8 rounded-lg bg-ai-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
                <item.icon className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 max-w-sm text-xs font-medium uppercase tracking-widest text-white/60 animate-slide-up" style={{ animationDelay: "0.6s" }}>
        Youth Economic Digital Twin Platform
      </p>
    </div>
  );

  return (
    <>
      <div className="flex min-h-screen flex-col animate-fade-in bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-foreground sm:flex-row dark:from-background dark:via-background dark:to-muted/60">
        {leftPanel}

        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="absolute right-4 top-4 z-30">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md">
            <motion.div
              className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 md:p-9 dark:bg-card"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="lg:hidden mb-6 sm:mb-8">
                <Logo variant="default" size="md" linkTo="/" />
              </div>
              
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full mb-4">
                  <Sparkles className="h-3 w-3 text-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Secure Portal</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-tight">Sign in</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  New to EmpowaAI?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email Input */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <label
                    className={`auth-floating-label ${
                      emailFocused || email
                        ? "auth-floating-label-shrink text-secondary font-bold"
                        : "text-sm text-muted-foreground"
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
                    className={`min-h-[52px] w-full rounded-xl border py-3.5 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground transition-all duration-200 ${
                      emailFocused
                        ? "border-secondary/50 bg-background ring-2 ring-secondary/10 shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                        : "border-border/60 bg-background"
                    }`}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                  <label
                    className={`auth-floating-label ${
                      passwordFocused || password
                        ? "auth-floating-label-shrink text-secondary font-bold"
                        : "text-sm text-muted-foreground"
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
                    className={`min-h-[52px] w-full rounded-xl border py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground transition-all duration-200 ${
                      passwordFocused
                        ? "border-secondary/50 bg-background ring-2 ring-secondary/10 shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                        : "border-border/60 bg-background"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-primary/10 rounded-lg auth-icon-button-hover"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                    <input type="checkbox" className="rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4 transition-all cursor-pointer bg-background" />
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Remember me</span>
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
                  className="shimmer w-full py-4 bg-cta-gradient text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-cta hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 min-h-[56px] text-base group"
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

              {/* Create Account Link at the bottom */}
              <div className="mt-6 text-center pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Not registered?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors inline-flex items-center gap-1">
                    Create new account
                    <Sparkles className="h-3 w-3" />
                  </Link>
                </p>
              </div>

              {/* Back to Homepage Button */}
              <div className="mt-4 text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <Home className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Homepage
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Policy Modals */}
        <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" icon={Shield}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">1. Information We Collect</h3>
            <p>We collect information you provide directly to us, including your name, email address, phone number, CV/resume data, career preferences, and usage information.</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">2. How We Use Your Information</h3>
            <p>We use your information to provide AI-powered career guidance, analyze your CV for opportunities, match you with potential employers, personalize your experience, and improve our services.</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">3. Data Security</h3>
            <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">4. Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@empowa-ai.co.za for any privacy concerns.</p>
          </div>
        </Modal>

        <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service" icon={FileText}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">1. Acceptance of Terms</h3>
            <p>By accessing or using EmpowAI, you agree to be bound by these Terms of Service.</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">2. User Accounts</h3>
            <p>You must be at least 18 years old to use this service. You are responsible for maintaining account security and all activities under your account.</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">3. AI Services</h3>
            <p>Our AI provides recommendations based on your data. These are suggestions only - final career decisions are yours alone.</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">4. Prohibited Conduct</h3>
            <p>You may not misuse our platform, upload malicious content, impersonate others, or violate any applicable laws.</p>
          </div>
        </Modal>

        <Modal isOpen={showCookies} onClose={() => setShowCookies(false)} title="Cookies Policy" icon={Cookie}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">What Are Cookies?</h3>
            <p>Cookies are small text files stored on your device that help us provide and improve our services.</p>
            <h3 className="text-primary font-semibold mt-4 mb-2">Types of Cookies We Use</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings like language and theme</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
            </ul>
          </div>
        </Modal>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div className="text-center sm:text-left">
              <Logo variant="default" size="md" linkTo="/" />
              <p className="mt-4 text-sm text-muted-foreground">
                Empowering South African youth through AI-driven career guidance and economic opportunities.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                {[Facebook, TikTokIcon, Mail, Instagram, Linkedin].map((Icon, i) => {
                  const socialLinks = [
                    "https://www.facebook.com/profile.php?id=61562941456913",
                    "https://www.tiktok.com/@empowa.ai",
                    "mailto:info@empowa.org",
                    "https://www.instagram.com/empowa.ai/",
                    "https://www.linkedin.com/company/empowaai"
                  ];
                  const socialLabels = ["Facebook", "TikTok", "Email", "Instagram", "LinkedIn"];
                  const isEmail = socialLinks[i].startsWith('mailto:');
                  return (
                    <a
                      key={i}
                      href={socialLinks[i]}
                      {...(!isEmail && { target: "_blank", rel: "noopener noreferrer" })}
                      aria-label={socialLabels[i]}
                      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-smooth hover:bg-secondary hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h4 className="font-display font-semibold text-primary mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link to="/demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">Demo</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="text-center sm:text-left">
              <h4 className="font-display font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setShowPrivacy(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto sm:mx-0">
                    <Shield className="h-3 w-3" /> Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowTerms(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto sm:mx-0">
                    <FileText className="h-3 w-3" /> Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowCookies(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto sm:mx-0">
                    <Cookie className="h-3 w-3" /> Cookies Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center sm:text-left">
              <h4 className="font-display font-semibold text-primary mb-4">Get in Touch</h4>
              <ul className="space-y-3">
                <li className="flex items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@empowa.org</span>
                </li>
                <li className="flex items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>South Africa</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu <span className="emoji">🇿🇦</span> · Built in Mzansi
            </p>
          </div>
        </div>
      </footer>

      <ContactWidget />
    </>
  );
}