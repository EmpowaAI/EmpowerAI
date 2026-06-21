import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Loader2, Sparkles, Zap, MapPin,
  CheckCircle2, Facebook, Instagram, Linkedin, Mail, Github,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { API_BASE_URL } from "../lib/apiBase";

const heroBackgroundUrl = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);

/* ── IntersectionObserver count-up ──────────────────────────────────────── */
function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const step = target / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      setValue(Math.round(cur));
      if (cur >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { value, ref };
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { value: count, ref: counterRef } = useCountUp(2000);

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
    <>
      <style>{`
        /* Staggered entrance */
        @keyframes csUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-1 { animation: csUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .cs-2 { animation: csUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .cs-3 { animation: csUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.30s both; }
        .cs-4 { animation: csUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.44s both; }
        .cs-5 { animation: csUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.56s both; }

        /* Orbs */
        @keyframes csOrbA {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(28px,-38px) scale(1.07); }
          70%     { transform: translate(-18px,18px) scale(0.94); }
        }
        @keyframes csOrbB {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(-36px,26px) scale(1.09); }
          65%     { transform: translate(22px,-18px) scale(0.92); }
        }
        @keyframes csOrbC {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(16px,32px) scale(1.04); }
        }
        .cs-orb-a { animation: csOrbA 14s ease-in-out infinite; }
        .cs-orb-b { animation: csOrbB 19s ease-in-out infinite; }
        .cs-orb-c { animation: csOrbC 24s ease-in-out infinite; }

        /* Button glow ring */
        @keyframes csGlow {
          0%,100% { box-shadow: 0 0 0 0 hsl(22 95% 55% / 0), var(--shadow-cta); }
          50%     { box-shadow: 0 0 0 7px hsl(22 95% 55% / 0.18), var(--shadow-cta); }
        }
        .cs-btn-glow { animation: csGlow 3s ease-in-out infinite; }

        /* Stat entrance */
        @keyframes csStat {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .cs-stat { animation: csStat 0.7s cubic-bezier(0.22,1,0.36,1) both; }

        /* Mission stat number */
        @keyframes csMission {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-mission { animation: csMission 0.8s ease 0.2s both; }

        @media (prefers-reduced-motion: reduce) {
          .cs-1,.cs-2,.cs-3,.cs-4,.cs-5,
          .cs-orb-a,.cs-orb-b,.cs-orb-c,
          .cs-btn-glow,.cs-stat,.cs-mission { animation: none !important; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col font-sans">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-5">
          <Logo variant="light" size="md" linkTo="/" />
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/EmpowaAI/EmpowerAI"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <Github className="h-3.5 w-3.5" /> Open source
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center text-white min-h-[100svh] px-4 overflow-hidden">

          {/* Background image */}
          <img
            src={heroBackgroundUrl} alt="" aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />

          {/* Layered overlays — using design-system gradient direction */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,64%,12%)] via-black/40 to-[hsl(22,95%,12%)] opacity-80" aria-hidden />
          <div className="pointer-events-none absolute inset-0 ai-mesh opacity-30" aria-hidden />
          <div className="pointer-events-none absolute inset-0 hero-spotlight" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grain" aria-hidden />

          {/* Ambient orbs — use design-system hues */}
          <div aria-hidden className="cs-orb-a pointer-events-none absolute top-[12%] left-[6%] h-80 w-80 rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, hsl(22 95% 55%) 0%, transparent 72%)", filter: "blur(48px)" }} />
          <div aria-hidden className="cs-orb-b pointer-events-none absolute bottom-[18%] right-[5%] h-[420px] w-[420px] rounded-full opacity-18"
            style={{ background: "radial-gradient(circle, hsl(218 64% 52%) 0%, transparent 72%)", filter: "blur(64px)" }} />
          <div aria-hidden className="cs-orb-c pointer-events-none absolute top-[52%] left-[48%] h-64 w-64 -translate-x-1/2 rounded-full opacity-12"
            style={{ background: "radial-gradient(circle, hsl(258 60% 60%) 0%, transparent 72%)", filter: "blur(56px)" }} />

          {/* Content */}
          <div className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-6 sm:space-y-8 pt-28 sm:pt-24 pb-12 sm:pb-16">

            {/* Live badge */}
            <div className="cs-1 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-xs font-bold tracking-[0.14em] uppercase text-white/85 backdrop-blur-md shimmer">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                In development · Launching soon
              </span>
            </div>

            {/* Headline — Plus Jakarta Sans via font-display */}
            <div className="cs-2 space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.04] tracking-tight drop-shadow-sm">
                The career coach
                <br />
                <span className="text-gradient-ai">South Africa deserves.</span>
              </h1>
              <p className="text-sm sm:text-base font-medium text-white/60 tracking-wide">
                We're still building — sign up to be the first to know when we open.
              </p>
            </div>

            {/* Subtext */}
            <p className="cs-3 text-[1.1rem] sm:text-xl text-white/72 max-w-[520px] mx-auto leading-relaxed font-normal">
              AI that analyses your CV, rewrites it, preps you for interviews,
              and matches you to real opportunities — built for the South African
              job market from the ground up.
            </p>

            {/* Waitlist form */}
            <div className="cs-4 space-y-3">
              {status === "success" ? (
                <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-secondary/35 bg-secondary/10 backdrop-blur-md px-6 py-6 sm:px-10 sm:py-8 w-full max-w-sm mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-secondary" />
                  <p className="text-xl font-bold text-white font-display">You're in — we'll see you at launch.</p>
                  <p className="text-sm text-white/65 max-w-xs">One email when we go live. No spam, ever.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); if (status === "error") setStatus("idle"); }}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    className="flex-1 px-4 py-3.5 rounded-xl border border-white/22 bg-white/9 text-white placeholder:text-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-secondary/70 focus:border-transparent text-sm transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="cs-btn-glow inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/90 active:scale-[0.97] transition-all duration-150 disabled:opacity-60 shrink-0 shimmer"
                  >
                    {status === "loading"
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><span>Notify me at launch</span> <ArrowRight className="h-4 w-4" /></>
                    }
                  </button>
                </form>
              )}

              {errorMsg && <p className="text-sm text-red-300/90">{errorMsg}</p>}
              <p className="text-xs text-white/38">No spam. No account created. One email — when we go live.</p>
            </div>

            {/* Trust chips */}
            <div className="cs-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-secondary/80" /> Built for South Africa
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20 hidden sm:block" aria-hidden />
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Zap className="h-3.5 w-3.5 text-secondary/80" /> 60-second CV analysis
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20 hidden sm:block" aria-hidden />
              <span className="inline-flex items-center gap-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-secondary/80" /> All 9 provinces · Mzansi
              </span>
            </div>
          </div>
        </section>

        {/* ── Mission bar — brand gradient, always intentional ──────────── */}
        <section className="relative overflow-hidden py-10 px-4 bg-ai-gradient">
          {/* Inner glow bloom on the stat */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-[480px] rounded-full opacity-30"
            style={{ background: "radial-gradient(ellipse, hsl(22 95% 55%) 0%, transparent 70%)", filter: "blur(40px)" }} />

          <div className="relative container mx-auto max-w-3xl text-center space-y-2.5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/55">
              Why we're building this
            </p>
            <p className="cs-mission text-xl sm:text-2xl font-semibold text-white leading-snug">
              South Africa has a{" "}
              <span className="font-black text-2xl sm:text-[1.85rem] text-white"
                style={{ textShadow: "0 0 28px hsl(22 95% 70%), 0 0 60px hsl(22 95% 55% / 0.5)" }}>
                33% youth unemployment rate.
              </span>
              <br className="hidden sm:block" />
              {" "}Most young people can't afford a career coach.{" "}
              <span className="font-bold text-secondary/90">We're changing that.</span>
            </p>
          </div>
        </section>

        {/* ── Social proof counter ─────────────────────────────────────── */}
        <section className="relative overflow-hidden border-y border-border/60 py-16 px-4
          bg-[radial-gradient(ellipse_at_50%_0%,hsl(218_64%_28%_/_0.07)_0%,transparent_65%)]
          dark:bg-[radial-gradient(ellipse_at_50%_0%,hsl(218_64%_28%_/_0.18)_0%,transparent_65%)]">

          <div ref={counterRef} className="container mx-auto max-w-2xl text-center space-y-5">
            <p className="cs-stat text-[0.7rem] font-bold uppercase tracking-[0.18em] text-secondary">
              Growing every day
            </p>

            <p
              className="cs-stat font-display text-7xl sm:text-8xl font-extrabold text-primary dark:text-white tracking-tight leading-none"
              style={{ animationDelay: "0.1s", textShadow: "0 0 60px hsl(218 64% 52% / 0.2)" }}
            >
              {count.toLocaleString()}+
            </p>

            <div className="space-y-1">
              <p className="cs-stat text-base font-semibold text-foreground" style={{ animationDelay: "0.2s" }}>
                South Africans already on the waitlist
              </p>
              <p className="cs-stat text-sm text-muted-foreground max-w-xs mx-auto" style={{ animationDelay: "0.3s" }}>
                Join them and be among the first to access EmpowaAI when we open our doors.
              </p>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="bg-background border-t border-border px-4 py-10">
          <div className="container mx-auto max-w-4xl flex flex-col items-center gap-6">
            <Logo variant="default" size="md" linkTo="/" />

            <p className="text-sm text-muted-foreground text-center max-w-md">
              Have questions before we launch? Reach out — we'd love to hear from you.
            </p>

            <a href="mailto:info@empowa-ai.co.za"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              <Mail className="h-4 w-4" />
              info@empowa-ai.co.za
            </a>

            <div className="flex items-center gap-5">
              {[
                { href: "https://github.com/EmpowaAI/EmpowerAI", icon: Github, label: "GitHub" },
                { href: "https://www.facebook.com/people/EmpowaAI/61576072756983/", icon: Facebook, label: "Facebook" },
                { href: "https://www.instagram.com/empowaai/", icon: Instagram, label: "Instagram" },
                { href: "https://www.linkedin.com/company/empowaai/", icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors" aria-label={label}>
                  <Icon className="h-5 w-5" />
                </a>
              ))}
              <a href="https://www.tiktok.com/@empowaai" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} EmpowaAI · Amandla e-Ubuntu 🇿🇦 · Built in Mzansi
              {" · "}
              <a href="https://github.com/EmpowaAI/EmpowerAI" target="_blank" rel="noopener noreferrer"
                className="hover:text-secondary transition-colors underline underline-offset-2">
                Open source (MIT)
              </a>
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
