import { useState, useEffect } from "react";
import {
  ArrowRight, Loader2, Sparkles, Zap, MapPin,
  CheckCircle2, Facebook, Instagram, Linkedin, Mail,
  FileText, Brain, Briefcase, MessageSquare, TrendingUp, Shield,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { API_BASE_URL } from "../lib/apiBase";

const heroBackgroundUrl = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);

const features = [
  {
    icon: FileText,
    title: "CV Analyser",
    description: "Upload your CV and get an ATS readiness score, keyword gaps, and a full written breakdown in under 60 seconds.",
    tag: "60 seconds",
  },
  {
    icon: Sparkles,
    title: "CV Revamp",
    description: "AI rewrites your CV from scratch — optimised for the SA job market, ATS filters, and the specific industry you're targeting.",
    tag: "AI-powered",
  },
  {
    icon: Brain,
    title: "Digital Economic Twin",
    description: "Build an AI model of your career potential. See income projections, skill gaps, and your fastest path to your target role.",
    tag: "Personalised",
  },
  {
    icon: MessageSquare,
    title: "Interview Coach",
    description: "Practice real interviews with AI. Get scored on your answers and coached until you're ready for the real thing.",
    tag: "24 / 7",
  },
  {
    icon: Briefcase,
    title: "Opportunity Matching",
    description: "Jobs, learnerships, internships, and bursaries matched to your actual skill level — not just keywords on your CV.",
    tag: "All 9 provinces",
  },
  {
    icon: TrendingUp,
    title: "AI Mentor",
    description: "A career coach in your pocket. Ask anything, get real answers — available in South African languages, any time of day.",
    tag: "Always on",
  },
];

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState(0);

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
    <div className="min-h-screen flex flex-col font-sans">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-5">
        <Logo variant="light" size="md" linkTo="/" />
        <ThemeToggle />
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-white min-h-screen px-4">
        <img
          src={heroBackgroundUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ai-mesh opacity-35" aria-hidden />
        <div className="pointer-events-none absolute inset-0 hero-spotlight" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center animate-fade-up space-y-8 pt-24 pb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/90 uppercase backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            Early access — join the waitlist
          </div>

          {/* Headline */}
          <div className="space-y-5">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] drop-shadow-sm">
              The career coach
              <br />
              <span className="text-gradient-ai">South Africa deserves.</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto leading-relaxed">
              AI that analyses your CV, rewrites it, preps you for interviews, and matches you to real opportunities —
              built for the South African job market from the ground up.
            </p>
          </div>

          {/* Waitlist form */}
          <div className="space-y-4">
            {status === "success" ? (
              <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 backdrop-blur-md px-10 py-8">
                <CheckCircle2 className="h-12 w-12 text-secondary" />
                <p className="text-xl font-bold text-white">You're in — we'll see you at launch.</p>
                <p className="text-sm text-white/70 max-w-xs">
                  We'll send you a direct email the moment EmpowaAI opens to the public. No spam, ever.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
                    <>Get early access <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            )}

            {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

            <p className="text-xs text-white/50">
              No spam. No account created. One email — when we go live.
            </p>
          </div>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/70 pt-2">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-secondary" /> Built for South Africa
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-secondary" /> 60-second CV analysis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-secondary" /> All 9 provinces · Mzansi
            </span>
          </div>
        </div>
      </section>

      {/* ── Mission bar ─────────────────────────────────────────────────────── */}
      <section className="bg-secondary/10 border-y border-secondary/20 py-8 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest text-secondary">Why we're building this</p>
          <p className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
            South Africa has a <span className="text-secondary font-bold">33% youth unemployment rate.</span>
            <br className="hidden sm:block" /> Most young people can't afford a career coach.
            <span className="text-foreground font-bold"> We're changing that.</span>
          </p>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────────────────── */}
      <section className="bg-background py-20 px-4">
        <div className="container mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">What you're waiting for</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Six tools. One platform. Built for you.
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Everything a professional career coach does — available to every South African, for free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <Icon className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      {f.tag}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-base text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Social proof counter ─────────────────────────────────────────────── */}
      <section className="bg-muted/40 border-y border-border py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Growing every day</p>
          <p className="font-display text-6xl sm:text-7xl font-bold text-primary">
            {count.toLocaleString()}+
          </p>
          <p className="text-base text-muted-foreground">
            South Africans already on the waitlist
          </p>

          {/* Second CTA */}
          {status !== "success" && (
            <div className="pt-4">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
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
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/90 transition-colors disabled:opacity-60 shrink-0"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Join them <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
              {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
            </div>
          )}
          {status === "success" && (
            <div className="inline-flex items-center gap-2 text-secondary font-semibold text-base pt-2">
              <CheckCircle2 className="h-5 w-5" /> You're on the list — we'll be in touch.
            </div>
          )}
        </div>
      </section>

      {/* ── Open source note ─────────────────────────────────────────────────── */}
      <section className="bg-background py-12 px-4 border-b border-border">
        <div className="container mx-auto max-w-2xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Shield className="h-3.5 w-3.5" /> Open source · MIT licence
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            EmpowerAI is built in the open. The full codebase is public on GitHub —
            built by developers, for South Africa.
            If you want to contribute, the door is open.
          </p>
          <a
            href="https://github.com/EmpowaAI/EmpowerAI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
          >
            View on GitHub <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-background border-t border-border px-4 py-10">
        <div className="container mx-auto max-w-4xl flex flex-col items-center gap-6">
          <Logo variant="default" size="md" linkTo="/" />

          <p className="text-sm text-muted-foreground text-center max-w-md">
            Have questions before we launch? Reach out — we'd love to hear from you.
          </p>

          <a
            href="mailto:info@empowa-ai.co.za"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Mail className="h-4 w-4" />
            info@empowa-ai.co.za
          </a>

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
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EmpowaAI · Amandla e-Ubuntu 🇿🇦 · Built in Mzansi
          </p>
        </div>
      </footer>
    </div>
  );
}
