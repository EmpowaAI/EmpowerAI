// LandingPage.tsx - Complete with Authentication-Aware Navbar
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ConsentBanner } from "@/components/ConsentBanner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Rocket,
  HeartHandshake,
  Briefcase,
  Star,
  Play,
  ArrowRight,
  Upload,
  Gauge,
  Compass,
  CheckCircle2,
  Facebook,
  Mail,
  Instagram,
  Linkedin,
  Sparkles,
  Cpu,
  Zap,
  MapPin,
  Quote,
  TrendingUp,
  Menu,
  X,
  Languages,
  LogIn,
  Shield,
  FileText,
  Cookie,
  MessageSquare,
  Phone,
  Send,
  UserPlus,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import siyanda from "../assets/images/siyaimage.png";
import Logo from "@/components/ui/Logo";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { cn } from "@/lib/utils";
import { SA_LANGUAGES, translations, type SALanguage } from "@/lib/sa-languages";
import { useUser } from "@/contexts/user-context";
import toast from "react-hot-toast";

const heroBackgroundUrl = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);

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

export default function LandingPage() {
  const { user } = useUser(); // Get authentication state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Modal states
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Language rotation state
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<SALanguage>(SA_LANGUAGES[0]);
  
  // Get current translations
  const currentUbuntuProverb = translations.ubuntuProverb[currentLanguage];
  const currentMahala = translations.mahala[currentLanguage];
  const currentUbuntu = translations.ubuntu[currentLanguage];
  const currentOurTools = translations.ourTools[currentLanguage];
  const currentThePath = translations.thePath[currentLanguage];
  const currentLetsBegin = translations.letsBegin[currentLanguage];
  const currentWatch = translations.watch[currentLanguage];
  const currentSuccessStories = translations.successStories[currentLanguage];
  const currentPoweredBy = translations.poweredBy[currentLanguage];
  
  // Rotate language every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLanguageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SA_LANGUAGES.length;
        setCurrentLanguage(SA_LANGUAGES[nextIndex]);
        return nextIndex;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentLanguage]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
      setShowContact(false);
    }, 1000);
  };

  // Check if user is logged in
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ========== AUTHENTICATION-AWARE NAVBAR ========== */}
      <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* Logo - Left Side */}
            <div className="flex-shrink-0">
              <Logo variant="default" size="sm" linkTo="/" />
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#ubuntu-stories" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Stories
              </a>
              <Link to="/demo" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Demo
              </Link>
            </nav>

            {/* Right Side Actions - Authentication Aware */}
            <div className="flex items-center gap-3">
              {/* Language Badge - Desktop only */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <Languages className="h-3.5 w-3.5 text-secondary" />
                <span className={cn(
                  "text-xs font-medium transition-all duration-500",
                  isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                )}>
                  {currentLanguage}
                </span>
              </div>
              
              <ThemeToggle />
              
              {/* Authentication-Aware Buttons */}
              {isLoggedIn ? (
                // Show Profile Menu for logged-in users
                <ProfileMenu />
              ) : (
                // Show Sign In button for logged-out users
                <Link 
                  to="/login" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
              
              {/* Get Started Button - Only show for logged-out users */}
              {!isLoggedIn && (
                <Button asChild variant="cta" size="sm" className="hidden lg:flex shimmer">
                  <Link to="/signup">Get Started</Link>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn(
          "lg:hidden fixed inset-x-0 top-16 z-50 bg-background border-b border-border shadow-lg transition-all duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
        )}>
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <a 
              href="#how-it-works" 
              onClick={() => setIsMenuOpen(false)} 
              className="flex items-center py-3 px-4 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              onClick={() => setIsMenuOpen(false)} 
              className="flex items-center py-3 px-4 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Features
            </a>
            <a 
              href="#ubuntu-stories" 
              onClick={() => setIsMenuOpen(false)} 
              className="flex items-center py-3 px-4 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Ubuntu Stories
            </a>
            <Link 
              to="/demo" 
              onClick={() => setIsMenuOpen(false)} 
              className="flex items-center py-3 px-4 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Demo
            </Link>
            
            <div className="border-t border-border my-3 pt-3 space-y-2">
              {isLoggedIn ? (
                // Mobile view for logged-in users
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Logged in as</span>
                  <span className="text-sm font-medium text-primary">{user?.name?.split(' ')[0]}</span>
                </div>
              ) : (
                // Mobile view for logged-out users
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 text-base font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Link>
                  <Button asChild variant="cta" size="lg" className="w-full shimmer" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden text-white min-h-[600px] sm:min-h-[650px] flex items-center">
          <img
            src={heroBackgroundUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" aria-hidden />
          <div className="pointer-events-none absolute inset-0 ai-mesh opacity-35" aria-hidden />
          <div className="pointer-events-none absolute inset-0 hero-spotlight" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grain" aria-hidden />

          <div className="container relative z-10 py-16 sm:py-20 md:py-32 px-4 sm:px-6 mx-auto">
            <div className="mx-auto max-w-3xl text-center animate-fade-up">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary" />
                <span className={cn(
                  "transition-all duration-500 text-xs sm:text-sm",
                  isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                )}>
                  {currentPoweredBy}
                </span>
                <span className="text-base leading-none emoji">🇿🇦</span>
              </div>

              <h1 className="mt-4 sm:mt-6 font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] sm:leading-[1.05] drop-shadow-sm px-2">
                Your Future, <span className="text-gradient-ai">Powered by {currentUbuntu}</span>
              </h1>
              
              <p className="mx-auto mt-4 sm:mt-5 max-w-xl text-sm sm:text-base text-white/90 md:text-lg px-4">
                {currentUbuntuProverb}
              </p>

              <div className="mt-6 sm:mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row px-4">
                {!isLoggedIn && (
                  <Button asChild variant="cta" size="xl" className="shimmer w-full sm:w-auto text-sm sm:text-base">
                    <Link to="/signup">
                      {currentLetsBegin}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outlineLight" size="xl" className="w-full sm:w-auto text-sm sm:text-base">
                  <Link to="/demo">
                    <Play className="mr-1 h-4 w-4" />
                    {currentWatch}
                  </Link>
                </Button>
              </div>

              {/* Quick login link for returning users on mobile */}
              {!isLoggedIn && (
                <div className="mt-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Already have an account? Sign In
                  </Link>
                </div>
              )}

              <div className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] sm:text-xs text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Cpu className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary" />
                  Neural matching engine
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary" />
                  60-second analysis
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary" />
                  All 9 provinces · Mzansi
                </span>
              </div>
              
              {/* Language rotation indicator for mobile */}
              <div className="mt-4 md:hidden flex items-center justify-center gap-2 text-[10px] text-white/60">
                <Languages className="h-3 w-3" />
                <span className={cn(
                  "transition-all duration-500",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  {currentLanguage}: "{currentMahala}"
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b border-border bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6 sm:py-7">
            {[
              { icon: Rocket, title: "AI-powered career", sub: "guidance in 60 seconds" },
              { icon: HeartHandshake, title: "Rooted in", sub: `${currentUbuntu} values` },
              { icon: Briefcase, title: "Personalized pathways", sub: "to income growth" },
              { icon: Star, title: "Trusted by 2,000+ youth", sub: "Rated 4.9/5" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3 transition-smooth hover:translate-x-1">
                <span className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-smooth hover:scale-110 hover:bg-secondary hover:text-secondary-foreground">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.4} />
                </span>
                <div className="text-xs sm:text-sm leading-snug">
                  <div className="font-semibold text-primary">{title}</div>
                  <div className={cn(
                    "text-muted-foreground transition-all duration-500 text-xs sm:text-sm",
                    isAnimating ? "opacity-0" : "opacity-100"
                  )}>
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ubuntu Stories Section */}
        <section id="ubuntu-stories" className="bg-muted/50 py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                <span className={cn(
                  "transition-all duration-500",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  {currentSuccessStories}
                </span>
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-primary px-2">
                Siyanda&apos;s Journey: from R0 to R4,500/month
              </h2>
              <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-muted-foreground px-4">
                <span className={cn(
                  "transition-all duration-500 inline-block",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  {currentUbuntuProverb.split(' ').slice(0, 3).join(' ')}... — he didn't get lucky.
                </span>
              </p>
            </div>

            <div className="mx-auto mt-8 sm:mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
              {/* Siyanda Card */}
              <Card className="relative overflow-hidden border-border/70 bg-card p-4 sm:p-6 md:p-7 shadow-card-soft">
                <div className="mb-4 sm:mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-2 py-1 sm:px-3 text-[10px] sm:text-xs font-bold text-primary-foreground">
                  <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  CV Analyser · <span className={cn(
                    "transition-all duration-500",
                    isAnimating ? "opacity-0" : "opacity-100"
                  )}>{currentMahala}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <img
                    src={siyanda}
                    alt="Portrait of Siyanda Nkosi"
                    width={56}
                    height={56}
                    loading="lazy"
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-secondary/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-base sm:text-lg font-bold text-primary">Siyanda Nkosi, 22</h3>
                    <p className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Boksburg, Gauteng
                    </p>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Empowerment Score
                    </div>
                    <div className="font-display text-xl sm:text-2xl font-bold text-primary">
                      78<span className="text-xs sm:text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 rounded-xl border border-border/70 bg-background p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary" />
                    Income Transformation
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 text-center">
                    <div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Before</div>
                      <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-muted-foreground line-through">R0</div>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                    <div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">After</div>
                      <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-secondary">
                        R4,500<span className="text-[10px] sm:text-xs text-muted-foreground">/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { v: "5", l: "Paths Explored" },
                    { v: "6 wks", l: "To First Gig" },
                    { v: "95%", l: "Match Rate" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg bg-accent/50 p-2 sm:p-3 text-center">
                      <div className="font-display text-base sm:text-xl font-bold text-primary">{s.v}</div>
                      <div className="mt-0.5 text-[9px] sm:text-[11px] leading-tight text-muted-foreground">{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 sm:mt-5 space-y-2 border-t border-border/70 pt-3 sm:pt-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Top Path</span>
                    <span className="font-semibold text-primary">Tech Skills</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                    <span>Chosen after exploring 5 careers</span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-secondary" />
                      CV analysed in 60s
                    </span>
                  </div>
                </div>
              </Card>

              {/* Journey Section */}
              <div className="flex flex-col">
                <Card className="border-border/70 bg-card p-4 sm:p-6 md:p-7 shadow-card-soft">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-primary">
                    <span className={cn(
                      "transition-all duration-500",
                      isAnimating ? "opacity-0" : "opacity-100"
                    )}>
                      {currentThePath}
                    </span>
                  </h3>
                  <ol className="mt-4 sm:mt-5 space-y-3 sm:space-y-3.5">
                    {[
                      { t: "Uploaded CV", d: "Analyzed in 60 seconds" },
                      { t: "Explored 5 Paths", d: "Tech, Trades, SMME, Gov, Creative" },
                      { t: "Chose Tech Skills", d: "95% match — best fit" },
                      { t: "Hired in 6 weeks", d: "Junior dev, remote-friendly" },
                      { t: "R4,500/month", d: "Up from R0 — and growing" },
                    ].map((step, i) => (
                      <li key={step.t} className="flex gap-3 sm:gap-4 rounded-xl border border-border/60 bg-background/70 px-3 py-2 sm:px-4 sm:py-3">
                        <div className="flex flex-col items-center">
                          <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-[10px] sm:text-xs font-bold text-primary-foreground shadow-sm">
                            {i + 1}
                          </span>
                          {i < 4 && <span className="mt-1 h-full w-px flex-1 bg-border/80" />}
                        </div>
                        <div className="flex-1 pb-0.5 sm:pb-1">
                          <div className="font-semibold leading-tight text-primary text-sm sm:text-base">{step.t}</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm leading-snug text-muted-foreground">{step.d}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>

                <div className="mt-4 sm:mt-5 rounded-xl border border-border/70 border-l-4 border-l-secondary bg-card p-4 sm:p-5 shadow-card-soft">
                  <Quote className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  <p className="mt-2 font-display italic text-primary text-sm sm:text-base">
                    &quot;EmpowAI taught me that <span className={cn(
                      "transition-all duration-500",
                      isAnimating ? "opacity-0" : "opacity-100"
                    )}>{currentUbuntu.toLowerCase()}</span> is a business strategy.&quot;
                  </p>
                  <p className="mt-2 sm:mt-3 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Siyanda <span className="text-secondary">·</span> Featured story
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-12 sm:py-20">
          <div id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
            <div className="text-center">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                <span className={cn(
                  "transition-all duration-500",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  {currentOurTools}
                </span>
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary">How It Works</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground px-4">
                Three simple steps to discover your career potential.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-3">
              {[
                { n: "01", icon: Upload, title: "Upload Your CV", desc: "Drop your CV — or build one with us in minutes." },
                { n: "02", icon: Gauge, title: "Get Your Score", desc: "AI reveals your Empowerment Score and gaps." },
                { n: "03", icon: Compass, title: "Explore Career Paths", desc: "Compare 5+ paths with real income projections." },
              ].map(({ n, icon: Icon, title, desc }) => (
                <Card
                  key={title}
                  className="card-glow group relative overflow-hidden border-border/70 bg-card p-5 sm:p-7 text-center shadow-card-soft"
                >
                  <span className="pointer-events-none absolute right-3 top-2 sm:right-4 sm:top-3 font-display text-3xl sm:text-5xl font-extrabold text-primary/5 transition-transform duration-500 group-hover:scale-125 group-hover:text-secondary/10">
                    {n}
                  </span>
                  <div className="relative mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-500 group-hover:rotate-6 group-hover:bg-secondary group-hover:shadow-cta">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-500 group-hover:scale-110" strokeWidth={2.2} />
                  </div>
                  <h3 className="relative mt-4 sm:mt-5 font-display text-sm sm:text-base font-bold text-primary">{title}</h3>
                  <p className="relative mt-2 text-xs sm:text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 flex justify-center px-4">
              {!isLoggedIn && (
                <Button asChild variant="cta" size="xl" className="shimmer w-full sm:w-auto">
                  <Link to="/signup">
                    {currentLetsBegin}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="bg-muted/40 py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                <span className={cn(
                  "transition-all duration-500",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  {currentSuccessStories}
                </span>
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary px-2">
                Real Success Stories from Mzansi
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground px-4">
                See how EmpowAI is transforming careers across all 9 provinces.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-3">
              {[
                {
                  initials: "LM",
                  name: "Lerato Mokoena",
                  loc: "Cape Town, WC",
                  quote: "From Khayelitsha to a junior dev role. EmpowAI showed me tech skills I didn't know I had. Siyabonga!",
                  earn: "R12,000/mo",
                  path: "Student → Software Developer",
                },
                {
                  initials: "SK",
                  name: "Sipho Khumalo",
                  loc: "Durban, KZN",
                  quote: "The simulation showed me entrepreneurship was my path. Now I run my own spaza shop AND a marketing agency!",
                  earn: "R18,500/mo",
                  path: "Unemployed → Business Owner",
                },
                {
                  initials: "NT",
                  name: "Nomsa Tshabalala",
                  loc: "Johannesburg, GP",
                  quote: "From minimum wage to a career I love. The AI actually understood my reality as a young South African.",
                  earn: "R15,000/mo",
                  path: "Waitress → Marketing Pro",
                },
              ].map((t) => (
                <Card key={t.name} className="card-glow border-border/70 bg-card p-4 sm:p-6 shadow-card-soft">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-primary font-display text-xs sm:text-sm font-bold text-primary-foreground transition-transform duration-300 hover:scale-110 hover:rotate-6">
                      {t.initials}
                    </span>
                    <div>
                      <div className="font-bold text-primary text-sm sm:text-base">{t.name}</div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {t.loc}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm italic text-muted-foreground">&quot;{t.quote}&quot;</p>
                  <div className="mt-3 sm:mt-4 rounded-md bg-accent/50 p-2 sm:p-3 text-xs sm:text-sm">
                    <div className="text-[10px] sm:text-xs text-muted-foreground">💰 Current Earnings</div>
                    <div className="font-bold text-primary text-sm sm:text-base">{t.earn}</div>
                    <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">{t.path}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Only show for non-logged-in users */}
        {!isLoggedIn && (
          <section className="relative overflow-hidden border-t border-border bg-primary py-10 sm:py-14 text-center text-primary-foreground">
            <div className="ai-mesh absolute inset-0" aria-hidden />
            <div className="container relative mx-auto px-4 sm:px-6">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                <span className={cn(
                  "transition-all duration-500",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}>
                  {currentLetsBegin}
                </span>
              </span>
              <p className="mt-3 font-display text-lg sm:text-2xl md:text-3xl italic px-4">
                Join over <span className="text-gradient-ai font-bold not-italic">2,000+</span> young South Africans building better
                careers with AI. Together, we rise. <span className="emoji">🇿🇦</span>
              </p>
              <div className="mt-5 sm:mt-6 flex justify-center px-4">
                <Button asChild variant="cta" size="xl" className="shimmer w-full sm:w-auto">
                  <Link to="/signup">
                    {currentLetsBegin}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

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
                <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#ubuntu-stories" className="text-sm text-muted-foreground hover:text-primary transition-colors">Stories</a></li>
                <li><Link to="/demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">Demo</Link></li>
                {isLoggedIn && (
                  <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
                )}
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
                <li>
                  <button onClick={() => setShowContact(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto sm:mx-0">
                    <MessageSquare className="h-3 w-3" /> Contact Us
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
                  <span>aiempowa@gmail.com</span>
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
              <span className={cn(
                "transition-all duration-500",
                isAnimating ? "opacity-0" : "opacity-100"
              )}>
                {currentPoweredBy}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu <span className="emoji">🇿🇦</span> · Built in Mzansi
            </p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
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

      {/* Terms of Service Modal */}
      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service" icon={FileText}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">1. Acceptance of Terms</h3>
          <p>By accessing or using EmpowAI, you agree to be bound by these Terms of Service.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">2. User Accounts</h3>
          <p>You must be at least 18 years old to use this service. You are responsible for maintaining account security and all activities under your account.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">3. AI Services</h3>
          <p>Our AI provides recommendations based on your data. These are suggestions only - final career decisions are yours alone.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">4. Termination</h3>
          <p>We may terminate or suspend your account immediately for violations of these Terms.</p>
        </div>
      </Modal>

      {/* Cookies Policy Modal */}
      <Modal isOpen={showCookies} onClose={() => setShowCookies(false)} title="Cookies Policy" icon={Cookie}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">What Are Cookies?</h3>
          <p>Cookies are small text files stored on your device that help us provide and improve our services.</p>
          <h3 className="text-primary font-semibold mt-4 mb-2">Types of Cookies We Use</h3>
          <ul><li><strong>Essential Cookies:</strong> Required for platform functionality</li><li><strong>Preference Cookies:</strong> Remember your settings</li><li><strong>Analytics Cookies:</strong> Help us understand usage</li></ul>
        </div>
      </Modal>

      {/* Contact Us Modal */}
      <Modal isOpen={showContact} onClose={() => setShowContact(false)} title="Contact Us" icon={MessageSquare}>
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Name *</label><input type="text" required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Your full name" /></div>
          <div><label className="block text-sm font-medium mb-2">Email *</label><input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="your@email.com" /></div>
          <div><label className="block text-sm font-medium mb-2">Subject *</label><input type="text" required value={contactForm.subject} onChange={(e) => setContactForm({...contactForm, subject: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="What is this regarding?" /></div>
          <div><label className="block text-sm font-medium mb-2">Message *</label><textarea required rows={4} value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none" placeholder="How can we help you?" /></div>
          <Button type="submit" variant="cta" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send Message"}<Send className="ml-2 h-4 w-4" /></Button>
        </form>
      </Modal>

      <ContactWidget />
      <ConsentBanner />
    </div>
  );
}