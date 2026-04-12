// pages/SignupPage.tsx - POPIA compliant with 3 consent checkboxes
import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye, EyeOff, CheckCircle, Loader2, Sparkles,
  Shield, Zap, XCircle, Mail, User, Lock,
} from "lucide-react";
import toast from 'react-hot-toast';
import { authService } from "../../api/Index";
import Logo from "../../components/ui/Logo";
import ThemeToggle from "../../components/ui/ThemeToggle";
import signupBg from "../../assets/images/empowersignin.jpg";

export default function SignupPage() {
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState("");
  const [isLoading, setIsLoading]             = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

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
    // Clear the error for required consents when user ticks the box
    if (field === 'consentDataProcessing' || field === 'consentProfileSharing') {
      setConsentErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate text fields
    const nameValid     = validateField("name",     formData.name);
    const emailValid    = validateField("email",    formData.email);
    const passwordValid = validateField("password", formData.password);

    // Validate required POPIA consents
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

  // ─── Submit button disabled state ───────────────────────────────────────────
  // Disabled while loading OR while either required consent is unticked.
  const submitDisabled =
    isLoading ||
    !consents.consentDataProcessing ||
    !consents.consentProfileSharing;

  // ─── Left panel ─────────────────────────────────────────────────────────────
  const leftPanel = (
    <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">
      <img
        src={signupBg}
        alt="EmpowaAI"
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover object-center crisp-image"
      />
      <div className="absolute inset-0 panel-image-overlay" />
      <div className="absolute inset-0 panel-image-accent opacity-70" />

      <div className="relative z-10 max-w-lg space-y-6 animate-slide-up">
        <Logo variant="light" size="lg" linkTo="/" />
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80 panel-copy-shadow">
          Create your account
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white panel-copy-shadow">
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

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex flex-col sm:flex-row animate-fade-in">
        {leftPanel}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
          <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>
          <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="auth-card-surface p-6 sm:p-7 md:p-9 transition-all duration-300">
              <div className="lg:hidden mb-6 sm:mb-8"><Logo variant="default" size="md" linkTo="/" /></div>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-slide-up">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Check your email</h2>
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

  // ─── Registration form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60 flex flex-col sm:flex-row animate-fade-in">
      {leftPanel}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="auth-card-surface p-6 sm:p-7 md:p-9 transition-all duration-300">
            <div className="lg:hidden mb-6 sm:mb-8"><Logo variant="default" size="md" linkTo="/" /></div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Free Account</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">Create account</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">Sign in</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Name ── */}
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
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-foreground transition-all min-h-[52px] auth-input-enhanced ${
                    fieldErrors.name
                      ? "border-destructive/50 bg-destructive/5"
                      : nameFocused
                      ? "border-primary/50 shadow-lg shadow-primary/10 bg-primary/5"
                      : "border-border/40 hover:border-border/60 bg-card/40"
                  }`}
                  required
                />
                {fieldErrors.name && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-destructive animate-slide-up">
                    <XCircle className="h-3.5 w-3.5" /><span>{fieldErrors.name}</span>
                  </div>
                )}
              </div>

              {/* ── Email ── */}
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
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-base text-foreground transition-all min-h-[52px] auth-input-enhanced ${
                    fieldErrors.email
                      ? "border-destructive/50 bg-destructive/5"
                      : emailFocused
                      ? "border-primary/50 shadow-lg shadow-primary/10 bg-primary/5"
                      : "border-border/40 hover:border-border/60 bg-card/40"
                  }`}
                  required
                />
                {fieldErrors.email && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-destructive animate-slide-up">
                    <XCircle className="h-3.5 w-3.5" /><span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              {/* ── Password ── */}
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
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl text-base text-foreground transition-all min-h-[52px] auth-input-enhanced ${
                    fieldErrors.password
                      ? "border-destructive/50 bg-destructive/5"
                      : passwordFocused
                      ? "border-primary/50 shadow-lg shadow-primary/10 bg-primary/5"
                      : "border-border/40 hover:border-border/60 bg-card/40"
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

              {/* ── Password strength ── */}
              {formData.password && (
                <div className="space-y-2 animate-slide-up">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 rounded-full flex-1 transition-all ${
                          formData.password.length >= level * 2
                            ? level <= 2 ? "bg-destructive" : level === 3 ? "bg-sa-gold" : "bg-success"
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

              {/* ════════════════════════════════════════════════════════════════
                  POPIA CONSENT SECTION
                  Three separate checkboxes — no pre-ticking (POPIA requirement).
                  Consents 1 & 2 are required; Consent 3 is recommended.
              ════════════════════════════════════════════════════════════════ */}
              <div className="space-y-3 pt-2 border-t border-border/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> POPIA Consent
                </p>

                {/* Consent 1 — Required */}
                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consents.consentDataProcessing}
                      onChange={() => handleConsentChange('consentDataProcessing')}
                      className="mt-1 rounded border border-border/60 text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4 flex-shrink-0 cursor-pointer transition-all"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      I agree to EmpowaAI processing my personal information in accordance with the{" "}
                      <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </Link>. <span className="text-destructive">*</span>
                    </span>
                  </label>
                  {consentErrors.consentDataProcessing && (
                    <div className="flex items-center gap-1 ml-6 text-xs text-destructive animate-slide-up">
                      <XCircle className="h-3.5 w-3.5" /><span>{consentErrors.consentDataProcessing}</span>
                    </div>
                  )}
                </div>

                {/* Consent 2 — Required */}
                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consents.consentProfileSharing}
                      onChange={() => handleConsentChange('consentProfileSharing')}
                      className="mt-1 rounded border border-border/60 text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4 flex-shrink-0 cursor-pointer transition-all"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      I consent to my profile being shared with potential employers for job opportunities.{" "}
                      <span className="text-destructive">*</span>
                    </span>
                  </label>
                  {consentErrors.consentProfileSharing && (
                    <div className="flex items-center gap-1 ml-6 text-xs text-destructive animate-slide-up">
                      <XCircle className="h-3.5 w-3.5" /><span>{consentErrors.consentProfileSharing}</span>
                    </div>
                  )}
                </div>

                {/* Consent 3 — Recommended (optional) */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consents.consentAiProcessing}
                    onChange={() => handleConsentChange('consentAiProcessing')}
                    className="mt-1 rounded border border-border/60 text-primary focus:ring-2 focus:ring-primary/30 w-4 h-4 flex-shrink-0 cursor-pointer transition-all"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    I consent to my data being used for AI-based job matching and recommendations.{" "}
                    <span className="text-xs text-muted-foreground/70">(Recommended)</span>
                  </span>
                </label>

                <p className="text-xs text-muted-foreground/60 ml-0.5">
                  <span className="text-destructive">*</span> Required fields
                </p>
              </div>
              {/* ══ END POPIA CONSENT ══════════════════════════════════════════ */}

              {/* ── Error message ── */}
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

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={submitDisabled}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 min-h-[56px] text-base group"
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
    </div>
  );
}
