import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Loader2, Sparkles, Cpu, Zap, MapPin,
  LogIn, CheckCircle2, Facebook, Instagram, Linkedin, Mail,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { API_BASE_URL } from "../lib/apiBase";

const heroBackgroundUrl = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);

const FEATURES = [
  "AI-powered CV analysis with real improvement advice",
  "Digital Twin that maps your career market value",
  "Matched South African jobs, learnerships & bursaries",
  "Interview coaching built around your actual experience",
];

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState(0);

  // Animate the waitlist count up on load
  useEffect(() => {
    const target = 2000;
    const step = Math.ceil(target / 60);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok && res.status !== 409) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo variant="default" size="sm" linkTo="/" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section className="relative overflow-hidden text-white min-h-[600px] sm:min-h-[700px] flex items-center">
          {/* Background image */}
          <img
            src={heroBackgroundUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          {/* Overlays — identical to LandingPage */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" aria-hidden />
          <div className="pointer-events-none absolute inset-0 ai-mesh opacity-35" aria-hidden />
          <div className="pointer-events-none absolute inset-0 hero-spotlight" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grain" aria-hidden />

          <div className="container relative z-10 py-16 sm:py-24 px-4 sm:px-6 mx-auto">
            <div className="mx-auto max-w-3xl text-center animate-fade-up">

              {/* Badge */}
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Something big is coming &nbsp;·&nbsp; Mzansi 🇿🇦
              </div>

              {/* Heading */}
              <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] drop-shadow-sm px-2">
                Your Career Breakthrough,
                <br />
                <span className="text-gradient-ai">Powered by Ubuntu</span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base text-white/90 md:text-lg px-4">
                EmpowaAI turns your CV into a full career strategy — matched opportunities,
                income projections, and interview coaching, built for South Africa.
                <strong className="block mt-2 text-white/95">
                  We're putting the finishing touches. Be first when we open.
                </strong>
              </p>

              {/* Waitlist form / success */}
              <div className="mt-8 px-4">
                {status === "success" ? (
                  <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-8 py-6">
                    <CheckCircle2 className="h-10 w-10 text-secondary" />
                    <p className="text-lg font-bold text-white">You're on the list!</p>
                    <p className="text-sm text-white/80">
                      We'll email you the moment we open access.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                      className="flex-1 px-4 py-3.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/90 transition-colors disabled:opacity-60 shrink-0 shimmer"
                    >
                      {status === "loading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Notify Me
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {errorMsg && (
                  <p className="mt-2 text-sm text-red-300">{errorMsg}</p>
                )}
              </div>

              {/* Sign in link */}
              <div className="mt-5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Already have an account? Sign In
                </Link>
              </div>

              {/* Trust chips */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-secondary" />
                  Neural matching engine
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-secondary" />
                  60-second analysis
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-secondary" />
                  All 9 provinces · Mzansi
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ── Feature strip ───────────────────────────────────────────────────── */}
        <section className="border-b border-border bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6 sm:py-7">
            {FEATURES.map((f, i) => {
              const icons = [Cpu, Zap, MapPin, Sparkles];
              const Icon = icons[i];
              return (
                <div key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <p className="text-xs sm:text-sm leading-snug text-muted-foreground">{f}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Social proof ─────────────────────────────────────────────────────── */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Growing community
            </p>
            <p className="font-display text-4xl sm:text-5xl font-bold text-primary">
              {count.toLocaleString()}+
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              South Africans already on the waitlist — join them and get early access.
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background px-4 py-8">
        <div className="container mx-auto flex flex-col items-center gap-5">
          <Logo variant="default" size="sm" linkTo="/" />

          <div className="flex items-center gap-5">
            <a href="https://www.facebook.com/people/EmpowaAI/61576072756983/" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/empowaai/" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/company/empowaai/" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://www.tiktok.com/@empowaai" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a href="mailto:info@empowa-ai.co.za"
              className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
              <Mail className="h-5 w-5" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} EmpowaAI · Built for South Africa · info@empowa-ai.co.za
          </p>
        </div>
      </footer>
    </div>
  );
}
