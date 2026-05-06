// pages/SignupPage.tsx - POPIA compliant with popup modals and footer
import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye, EyeOff, CheckCircle, Loader2, Sparkles,
  Shield, Zap, XCircle, Mail, User, Lock, X,
  Facebook, Instagram, Linkedin, MapPin, Cookie, FileText, MessageSquare
} from "lucide-react";
import toast from 'react-hot-toast';
import { authService } from "@/api/Index";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ContactWidget } from "@/components/ContactWidget";
import TikTokIcon from "@/components/ui/TikTokIcon";
import signupBg from "@/assets/images/empowersignin.jpg";

// Modal Component (same as LandingPage)
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

export default function SignupPage() {
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState("");
  const [isLoading, setIsLoading]             = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Modal states
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

  const [formData, setFormData] = useState({
    name:     "",
    email:    "",
    password: "",
  });

  // ─── POPIA consent state ────────────────────────────────────────────────────
  const [consents, setConsents] = useState({
    consentDataProcessing: false, // Required
    consentProfileSharing: false, // Required
    consentAiProcessing:   false, // Recommended
  });

  const [consentErrors, setConsentErrors] = useState({
    consentDataProcessing: "",
    consentProfileSharing: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    name:     "",
    email:    "",
    password: "",
  });

  const [nameFocused,     setNameFocused]     = useState(false);
  const [emailFocused,    setEmailFocused]    = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // ─── Field validation ───────────────────────────────────────────────────────
  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim())              error = "Name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim())              error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Please enter a valid email address";
        break;
      case "password":
        if (!value)         error = "Password is required";
        else if (value.length < 6) error = "Password must be at least 6 characters";
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (value.length > 0 || fieldErrors[field as keyof typeof fieldErrors]) {
      validateField(field, value);
    }
  };

  // ─── Consent change handler ─────────────────────────────────────────────────
  const handleConsentChange = (field: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [field]: !prev[field] }));
    if (field === 'consentDataProcessing' || field === 'consentProfileSharing') {
      setConsentErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameValid     = validateField("name",     formData.name);
    const emailValid    = validateField("email",    formData.email);
    const passwordValid = validateField("password", formData.password);

    const newConsentErrors = {
      consentDataProcessing: consents.consentDataProcessing
        ? ""
        : "You must accept the Privacy Policy to register",
      consentProfileSharing: consents.consentProfileSharing
        ? ""
        : "You must consent to profile sharing to register",
    };
    setConsentErrors(newConsentErrors);

    const consentsValid =
      !newConsentErrors.consentDataProcessing &&
      !newConsentErrors.consentProfileSharing;

    if (!nameValid || !emailValid || !passwordValid || !consentsValid) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        ...formData,
        ...consents,
      });
      setRegisteredEmail(formData.email);
      toast.success(`Account created! Check your inbox, ${response.user?.name ?? formData.name}.`);
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const submitDisabled = isLoading || !consents.consentDataProcessing || !consents.consentProfileSharing;

  const leftPanel = (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
      <img
        src={signupBg}
        alt="EmpowaAI"
        loading="eager"
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center crisp-image"
      />
      <div className="absolute inset-0 panel-image-overlay" />
      <div className="absolute inset-0 panel-image-accent opacity-70" />

      <div className="relative z-10 max-w-lg space-y-6 animate-slide-up">
        <Logo variant="light" size="lg" linkTo="/" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
          Create your account
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight text-white drop-shadow-md">
          Start your journey to economic empowerment.
        </h1>
        <ul className="space-y-4">
          {[
            { text: "Build your Digital Economic Twin",    icon: Sparkles },
            { text: "Visualize your earning potential",    icon: Zap },
            { text: "Get personalized career guidance",    icon: CheckCircle },
            { text: "Access SA-specific opportunities",    icon: Shield },
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

      <p className="relative z-10 max-w-sm text-xs font-medium uppercase tracking-widest text-white/60 animate-slide-up" style={{ animationDelay: "0.6s" }}>
        Youth Economic Digital Twin Platform
      </p>
    </div>
  );

  if (registeredEmail) {
    return (
      <div className="flex min-h-screen flex-col animate-fade-in bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-foreground sm:flex-row dark:from-background dark:via-background dark:to-muted/60">
        {leftPanel}
        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="absolute right-4 top-4 z-30">
            <ThemeToggle />
          </div>
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 md:p-9 dark:bg-card">
              <div className="lg:hidden mb-6 sm:mb-8"><Logo variant="default" size="md" linkTo="/" /></div>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-ai-gradient flex items-center justify-center animate-glow-pulse shadow-glow">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight">Check your email</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">We sent a verification link to</p>
                  <p className="font-semibold text-foreground text-sm sm:text-base break-all">{registeredEmail}</p>
                </div>
                <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-muted-foreground text-left space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <p className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /><span>Open the email and click the verification link.</span></p>
                  <p className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /><span>The link will expire after 24 hours.</span></p>
                  <p className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /><span>Check your spam folder if you don&apos;t see it.</span></p>
                </div>
                <p className="text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  Already verified?{" "}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col animate-fade-in bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-foreground sm:flex-row dark:from-background dark:via-background dark:to-muted/60">
        {leftPanel}
        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="absolute right-4 top-4 z-30">
            <ThemeToggle />
          </div>
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-7 md:p-9 dark:bg-card">
              <div className="lg:hidden mb-6 sm:mb-8"><Logo variant="default" size="md" linkTo="/" /></div>

              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full mb-4">
                  <Shield className="h-3 w-3 text-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Free Account</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-2 tracking-tight">Create account</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">Sign in</Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors z-10" style={{
                    color: fieldErrors.name ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
                  }} />
                  <label className={`auth-floating-label ${
                    nameFocused || formData.name ? "auth-floating-label-shrink" : "text-sm"
                  } ${
                    fieldErrors.name ? "text-destructive" : nameFocused ? "text-primary" : "text-muted-foreground"
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    autoComplete="name"
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-base text-foreground transition-all min-h-[52px] ${
                      fieldErrors.name
                        ? "border-destructive/50 bg-destructive/5"
                        : nameFocused
                        ? "border-secondary/50 ring-2 ring-secondary/10 bg-background" 
                        : "border-border/60 bg-background"
                    }`}
                    required
                  />
                  {fieldErrors.name && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-destructive animate-slide-up">
                      <XCircle className="h-3.5 w-3.5" /><span>{fieldErrors.name}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors z-10" style={{
                    color: fieldErrors.email ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
                  }} />
                  <label className={`auth-floating-label ${
                    emailFocused || formData.email ? "auth-floating-label-shrink" : "text-sm"
                  } ${
                    fieldErrors.email ? "text-destructive" : emailFocused ? "text-primary" : "text-muted-foreground"
                  }`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-xl text-base text-foreground transition-all min-h-[52px] ${
                      fieldErrors.email
                        ? "border-destructive/50 bg-destructive/5"
                        : emailFocused
                        ? "border-secondary/50 ring-2 ring-secondary/10 bg-background" 
                        : "border-border/60 bg-background"
                    }`}
                    required
                  />
                  {fieldErrors.email && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-destructive animate-slide-up">
                      <XCircle className="h-3.5 w-3.5" /><span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors z-10" style={{
                    color: fieldErrors.password ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
                  }} />
                  <label className={`auth-floating-label ${
                    passwordFocused || formData.password ? "auth-floating-label-shrink" : "text-sm"
                  } ${
                    fieldErrors.password ? "text-destructive" : passwordFocused ? "text-primary" : "text-muted-foreground"
                  }`}>
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    autoComplete="new-password"
                    className={`w-full pl-12 pr-12 py-3.5 border rounded-xl text-base text-foreground transition-all min-h-[52px] ${
                      fieldErrors.password
                        ? "border-destructive/50 bg-destructive/5"
                        : passwordFocused
                        ? "border-secondary/50 ring-2 ring-secondary/10 bg-background" 
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
                  {fieldErrors.password && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-destructive animate-slide-up">
                      <XCircle className="h-3.5 w-3.5" /><span>{fieldErrors.password}</span>
                    </div>
                  )}
                </div>

                {/* Password strength */}
                {formData.password && (
                  <div className="space-y-2 animate-slide-up">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            formData.password.length >= level * 2
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
                      {formData.password.length < 6
                        ? "Password too weak"
                        : formData.password.length < 8
                        ? "Password could be stronger"
                        : "Strong password"}
                    </p>
                  </div>
                )}

                {/* POPIA CONSENT SECTION */}
                <div className="space-y-3 pt-2 border-t border-border/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> POPIA Consent
                  </p>

                  <div className="space-y-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={consents.consentDataProcessing}
                        onChange={() => handleConsentChange('consentDataProcessing')}
                        className="mt-1 rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4 flex-shrink-0 cursor-pointer transition-all bg-background"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        I agree to EmpowaAI processing my personal information in accordance with the{" "}
                        <button type="button" onClick={() => setShowPrivacy(true)} className="text-secondary hover:underline">
                          Privacy Policy
                        </button>. <span className="text-destructive">*</span>
                      </span>
                    </label>
                    {consentErrors.consentDataProcessing && (
                      <div className="flex items-center gap-1 ml-6 text-xs text-destructive animate-slide-up">
                        <XCircle className="h-3.5 w-3.5" /><span>{consentErrors.consentDataProcessing}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={consents.consentProfileSharing}
                        onChange={() => handleConsentChange('consentProfileSharing')}
                        className="mt-1 rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4 flex-shrink-0 cursor-pointer transition-all bg-background"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        I consent to my profile being shared with potential employers in accordance with the{" "}
                        <button type="button" onClick={() => setShowTerms(true)} className="text-secondary hover:underline">
                          Terms of Service
                        </button>. <span className="text-destructive">*</span>
                      </span>
                    </label>
                    {consentErrors.consentProfileSharing && (
                      <div className="flex items-center gap-1 ml-6 text-xs text-destructive animate-slide-up">
                        <XCircle className="h-3.5 w-3.5" /><span>{consentErrors.consentProfileSharing}</span>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consents.consentAiProcessing}
                      onChange={() => handleConsentChange('consentAiProcessing')}
                      className="mt-1 rounded border-border/60 text-secondary focus:ring-secondary/30 w-4 h-4 flex-shrink-0 cursor-pointer transition-all bg-background"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      I consent to my data being used for AI-based job matching and recommendations as described in the{" "}
                      <button type="button" onClick={() => setShowCookies(true)} className="text-secondary hover:underline">
                        Cookies Policy
                      </button>. <span className="text-xs text-muted-foreground/70">(Recommended)</span>
                    </span>
                  </label>

                  <p className="text-xs text-muted-foreground/60 ml-0.5">
                    <span className="text-destructive">*</span> Required fields
                  </p>
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
                  disabled={submitDisabled}
                  className="shimmer w-full py-4 bg-cta-gradient text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-cta hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 min-h-[56px] text-base group"
                >
                  {isLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /><span>Creating account...</span></>
                  ) : (
                    <><span>Create account</span><Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>
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

        <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service" icon={Shield}>
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

        <Modal isOpen={showCookies} onClose={() => setShowCookies(false)} title="Cookies Policy" icon={Shield}>
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
                    "mailto:info@empowa-ai.co.za",
                    "https://www.instagram.com/empowa.ai/",
                    "https://www.linkedin.com/company/empowaai"
                  ];
                  const socialLabels = ["Facebook", "TikTok", "Email", "Instagram", "LinkedIn"];
                  return (
                    <a
                      key={i}
                      href={socialLinks[i]}
                      target="_blank"
                      rel="noopener noreferrer"
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
                <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
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
                  <span>info@empowa-ai.co.za</span>
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