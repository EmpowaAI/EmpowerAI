import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, Sparkles, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import DemoSection from "@/components/DemoSection";
import { Menu, X, Mail, MapPin, Facebook, Instagram, Linkedin, Shield, FileText, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import TikTokIcon from "@/components/ui/TikTokIcon";

// Modal Component for legal pages
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

export default function Demo() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Modal states
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Logo variant="default" size="md" linkTo="/" />

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Home
            </Link>
            <Link to="/signup" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Sign Up
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to site
              </Link>
            </Button>
            <ProfileMenu />

            {/* Hamburger Toggle */}
            <button
              className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-md transition-smooth"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={cn(
          "md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
        )}>
          <nav className="container py-12 flex flex-col items-center gap-8">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold text-primary hover:text-secondary transition-colors">
              Home
            </Link>
            <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold text-primary hover:text-secondary transition-colors">
              Sign Up
            </Link>
            <div className="flex flex-col w-full gap-4 pt-8 border-t border-border/40">
              <Button asChild variant="outline" size="xl" className="w-full rounded-2xl" onClick={() => setIsMenuOpen(false)}>
                <Link to="/">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to site
                </Link>
              </Button>
              <Button asChild variant="cta" size="xl" className="w-full rounded-2xl shimmer" onClick={() => setIsMenuOpen(false)}>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="relative px-4 py-12 sm:py-16 text-white"
            style={{ background: 'var(--gradient-hero)' }}
          >
            {/* Background textures */}
            <div className="pointer-events-none absolute inset-0 ai-mesh opacity-10" aria-hidden />
            <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-15" aria-hidden />

            <div className="container relative z-10">
              {/* Back link (mobile) */}
              <Link
                to="/"
                className="mb-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 hover:text-white/90 transition-colors sm:hidden"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </Link>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 mb-4">
                    <Sparkles className="h-3 w-3" />
                    Interactive Demo
                  </div>
                  <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight">
                    Try EmpowaAI<br className="hidden sm:block" /> in 60 seconds
                  </h1>
                  <p className="mt-3 text-white/70 text-sm sm:text-base max-w-md leading-relaxed">
                    CV Analyser · AI revamp · Digital Twin — all free. See the full flow, then sign up to unlock your real career journey.
                  </p>

                  {/* Feature pills */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      { Icon: Brain,    label: 'AI CV Analysis'   },
                      { Icon: Zap,      label: 'Instant Revamp'   },
                      { Icon: Users,    label: 'Digital Twin'      },
                    ].map(({ Icon, label }) => (
                      <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-white/85">
                        <Icon className="h-3 w-3" />
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="bg-white text-primary font-bold hover:bg-white/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      <Link to="/signup">
                        Get Started Free
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg" className="border border-white/25 text-white hover:bg-white/10">
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-4 md:text-right shrink-0">
                  {[
                    { value: '60s',   label: 'to first result'     },
                    { value: '100%',  label: 'free, no card needed' },
                    { value: '5',     label: 'career paths mapped'  },
                  ].map(({ value, label }) => (
                    <div key={label} className="rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-center md:text-right">
                      <p className="font-display font-bold text-xl sm:text-2xl">{value}</p>
                      <p className="text-white/60 text-xs mt-0.5 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <DemoSection />
      </main>

      {/* Full Footer - Same as LandingPage */}
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
                <li><Link to="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            {/* Legal Links - Popup Modals */}
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
              © {new Date().getFullYear()} EmpowaAI · Amandla e-Ubuntu <span className="emoji">🇿🇦</span> · Built in Mzansi
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
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
          <p>By accessing or using EmpowaAI, you agree to be bound by these Terms of Service.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">2. User Accounts</h3>
          <p>You must be at least 18 years old to use this service. You are responsible for maintaining account security and all activities under your account.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">3. AI Services</h3>
          <p>Our AI provides recommendations based on your data. These are suggestions only - final career decisions are yours alone.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">4. Termination</h3>
          <p>We may terminate or suspend your account immediately for violations of these Terms.</p>
        </div>
      </Modal>

      <Modal isOpen={showCookies} onClose={() => setShowCookies(false)} title="Cookies Policy" icon={Cookie}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">What Are Cookies?</h3>
          <p>Cookies are small text files stored on your device that help us provide and improve our services.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">Types of Cookies We Use</h3>
          <ul><li><strong>Essential Cookies:</strong> Required for platform functionality</li><li><strong>Preference Cookies:</strong> Remember your settings</li><li><strong>Analytics Cookies:</strong> Help us understand usage</li></ul>
        </div>
      </Modal>

      <ContactWidget />
    </div>
  );
}