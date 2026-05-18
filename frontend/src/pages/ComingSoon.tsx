import { useState, useEffect } from "react";
import {
  ArrowRight, Loader2, Sparkles, Zap, MapPin,
  CheckCircle2, Facebook, Instagram, Linkedin, Mail,
  Clock, Bell,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { API_BASE_URL } from "../lib/apiBase";

const heroBackgroundUrl = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);


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

      {/* ── Minimal top bar ─────────────────────────────────────────────────── */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-5">
        <Logo variant="light" size="md" linkTo="/" />
        <ThemeToggle />
      </header>

      {/* ── Full-screen hero ────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-white min-h-screen px-4">
        {/* Background */}
        <img
          src={heroBackgroundUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" aria-hidden />
        <div className="pointer-events-none absolute inset-0 ai-mesh opacity-35" aria-hidden />
        <div className="pointer-events-none absolute inset-0 hero-spotlight" aria-hidden />
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden />

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center animate-fade-up space-y-6 pt-24 pb-16">

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/90 uppercase backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            Not yet open to the public
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] drop-shadow-sm">
              Your Career Breakthrough,
              <br />
              <span className="text-gradient-ai">Powered by Ubuntu</span>
            </h1>

            {/* Clear status message */}
            <div className="mx-auto max-w-xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-4 space-y-1">
              <div className="flex items-center justify-center gap-2 text-secondary font-bold text-base">
                <Clock className="h-5 w-5" />
                We're still building — not open yet
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                EmpowaAI is currently in development and not available to the public.
                We're working hard to bring you the most powerful AI career platform
                built for South Africa. Leave your email below and we'll notify you
                the moment we launch.
              </p>
            </div>
          </div>

          {/* Waitlist form */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium">
              <Bell className="h-4 w-4 text-secondary" />
              Get notified when we launch
            </div>

            {status === "success" ? (
              <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 backdrop-blur-md px-10 py-6">
                <CheckCircle2 className="h-12 w-12 text-secondary" />
                <p className="text-xl font-bold text-white">You're on the list!</p>
                <p className="text-sm text-white/80 max-w-xs">
                  We'll send you a direct email the moment EmpowaAI opens to the public.
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
                    <>Notify Me <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            )}

            {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

            <p className="text-xs text-white/50">
              No spam. No account created. We email you once — when we're live.
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

      {/* ── Social proof counter ─────────────────────────────────────────────── */}
      <section className="bg-muted/40 border-y border-border py-14 px-4">
        <div className="container mx-auto max-w-2xl text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Growing fast</p>
          <p className="font-display text-5xl sm:text-6xl font-bold text-primary">
            {count.toLocaleString()}+
          </p>
          <p className="text-base text-muted-foreground">
            South Africans already on the waitlist
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Join them and be among the first to access EmpowaAI when we open our doors.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-background border-t border-border px-4 py-10">
        <div className="container mx-auto max-w-4xl flex flex-col items-center gap-6">
          <Logo variant="default" size="md" linkTo="/" />

          <p className="text-sm text-muted-foreground text-center max-w-md">
            Have questions before we launch? Reach out to our team — we'd love to hear from you.
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
            © {new Date().getFullYear()} EmpowaAI · Built for South Africa · Not yet open to the public
          </p>
        </div>
      </footer>
    </div>
  );
}
