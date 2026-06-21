import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Loader2, Sparkles, Zap, MapPin,
  CheckCircle2, Facebook, Instagram, Linkedin, Mail,
  Github,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { API_BASE_URL } from "../lib/apiBase";

const heroBackgroundUrl = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);

/* ── Floating particle canvas ─────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 38;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.5 + 0.15,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      aria-hidden
    />
  );
}

/* ── Animated count-up ────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const interval = duration / steps;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { value, ref };
}

/* ── Main component ───────────────────────────────────────────────────────── */
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
      {/* ── Custom keyframes ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes cs-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(30px, -40px) scale(1.08); }
          70% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes cs-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(-40px, 30px) scale(1.1); }
          65% { transform: translate(25px, -20px) scale(0.93); }
        }
        @keyframes cs-float-c {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 35px) scale(1.05); }
        }
        @keyframes cs-glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,160,0,0), 0 4px 24px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(255,160,0,0.15), 0 4px 24px rgba(0,0,0,0.3); }
        }
        @keyframes cs-badge-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes cs-stat-in {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cs-ring-spin {
          from { stroke-dashoffset: 340; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes cs-fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-orb-a { animation: cs-float-a 14s ease-in-out infinite; }
        .cs-orb-b { animation: cs-float-b 18s ease-in-out infinite; }
        .cs-orb-c { animation: cs-float-c 22s ease-in-out infinite; }
        .cs-cta-btn { animation: cs-glow-pulse 3s ease-in-out infinite; }
        .cs-stat-in { animation: cs-stat-in 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .cs-ring { animation: cs-ring-spin 2s cubic-bezier(0.4,0,0.2,1) 0.3s both; }
        .cs-d1 { animation: cs-fade-in-up 0.6s ease both; }
        .cs-d2 { animation: cs-fade-in-up 0.6s ease 0.12s both; }
        .cs-d3 { animation: cs-fade-in-up 0.6s ease 0.24s both; }
        .cs-d4 { animation: cs-fade-in-up 0.6s ease 0.38s both; }
        .cs-d5 { animation: cs-fade-in-up 0.6s ease 0.52s both; }
        @media (prefers-reduced-motion: reduce) {
          .cs-orb-a, .cs-orb-b, .cs-orb-c, .cs-cta-btn, .cs-ring,
          .cs-d1, .cs-d2, .cs-d3, .cs-d4, .cs-d5, .cs-stat-in {
            animation: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen flex flex-col font-sans">

        {/* ── Top bar ───────────────────────────────────────────────────────── */}
        <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-5">
          <Logo variant="light" size="md" linkTo="/" />
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/EmpowaAI/EmpowerAI"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="View on GitHub"
            >
              <Github className="h-3.5 w-3.5" />
              Open source
            </a>
            <ThemeToggle />
          </div>
        </header>

        {/* ── Full-screen hero ──────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center text-white min-h-screen px-4 overflow-hidden">

          {/* Background */}
          <img
            src={heroBackgroundUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" aria-hidden />
          <div className="pointer-events-none absolute inset-0 ai-mesh opacity-35" aria-hidden />
          <div className="pointer-events-none absolute inset-0 hero-spotlight" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grain" aria-hidden />

          {/* Floating ambient orbs */}
          <div
            aria-hidden
            className="cs-orb-a pointer-events-none absolute top-[15%] left-[8%] h-72 w-72 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(35,95%,55%) 0%, transparent 70%)", filter: "blur(40px)" }}
          />
          <div
            aria-hidden
            className="cs-orb-b pointer-events-none absolute bottom-[20%] right-[6%] h-96 w-96 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, hsl(210,80%,55%) 0%, transparent 70%)", filter: "blur(60px)" }}
          />
          <div
            aria-hidden
            className="cs-orb-c pointer-events-none absolute top-[55%] left-[50%] h-64 w-64 -translate-x-1/2 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(270,70%,60%) 0%, transparent 70%)", filter: "blur(50px)" }}
          />

          {/* Particle layer */}
          <ParticleCanvas />

          {/* Content */}
          <div className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-7 pt-24 pb-16">

            {/* Status badge */}
            <div className="cs-d1 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/90 uppercase backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                Early access — join the waitlist
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="cs-d2 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] drop-shadow-sm">
                The career coach
                <br />
                <span className="text-gradient-ai">South Africa deserves.</span>
              </h1>

              <p className="cs-d3 text-lg sm:text-xl text-white/75 max-w-xl mx-auto leading-relaxed">
                AI that analyses your CV, rewrites it, preps you for interviews,
                and matches you to real opportunities — built for the South African
                job market from the ground up.
              </p>
            </div>

            {/* Waitlist form */}
            <div className="cs-d4 space-y-3">
              {status === "success" ? (
                <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 backdrop-blur-md px-10 py-8">
                  <CheckCircle2 className="h-12 w-12 text-secondary" />
                  <p className="text-xl font-bold text-white">You're in — we'll see you at launch.</p>
                  <p className="text-sm text-white/70 max-w-xs">
                    One email when we go live. No spam, ever.
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
                    className="flex-1 px-4 py-3.5 rounded-xl border border-white/25 bg-white/10 text-white placeholder:text-white/45 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm transition-all"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="cs-cta-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/90 active:scale-95 transition-all disabled:opacity-60 shrink-0 shimmer"
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

              <p className="text-xs text-white/45">
                No spam. No account created. One email — when we go live.
              </p>
            </div>

            {/* Trust chips */}
            <div className="cs-d5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/65 pt-1">
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

        {/* ── Mission bar ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-y border-secondary/20 py-10 px-4"
          style={{ background: "linear-gradient(135deg, hsl(35,95%,8%) 0%, hsl(35,60%,5%) 50%, hsl(220,40%,8%) 100%)" }}
        >
          {/* Subtle glow behind the stat */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-96 rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, hsl(35,95%,50%) 0%, transparent 70%)", filter: "blur(40px)" }}
          />
          <div className="relative container mx-auto max-w-3xl text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary/80">Why we're building this</p>
            <p className="text-xl sm:text-2xl font-semibold text-white leading-snug">
              South Africa has a{" "}
              <span
                className="text-secondary font-black text-2xl sm:text-3xl"
                style={{ textShadow: "0 0 30px hsl(35,95%,50%)" }}
              >
                33% youth unemployment rate.
              </span>
              <br className="hidden sm:block" />
              {" "}Most young people can't afford a career coach.{" "}
              <span className="text-white font-bold">We're changing that.</span>
            </p>
          </div>
        </section>

        {/* ── Social proof counter ──────────────────────────────────────────── */}
        <section className="bg-muted/40 border-b border-border py-16 px-4">
          <div ref={counterRef} className="container mx-auto max-w-2xl text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary cs-stat-in">
              Growing every day
            </p>

            {/* Number with decorative ring */}
            <div className="relative inline-flex items-center justify-center cs-stat-in" style={{ animationDelay: "0.1s" }}>
              <svg
                className="absolute -inset-6 cs-ring"
                viewBox="0 0 120 120"
                fill="none"
                width="180"
                height="180"
                aria-hidden
              >
                <circle
                  cx="60" cy="60" r="54"
                  stroke="hsl(35,95%,55%)"
                  strokeWidth="1"
                  strokeDasharray="339"
                  strokeDashoffset="339"
                  strokeLinecap="round"
                  opacity="0.35"
                  style={{ animation: "cs-ring-spin 2.2s cubic-bezier(0.4,0,0.2,1) 0.4s forwards" }}
                />
              </svg>
              <p
                className="font-display text-6xl sm:text-7xl font-bold text-primary"
                style={{ textShadow: "0 0 60px hsl(var(--primary) / 0.3)" }}
              >
                {count.toLocaleString()}+
              </p>
            </div>

            <p className="text-base text-muted-foreground cs-stat-in" style={{ animationDelay: "0.2s" }}>
              South Africans already on the waitlist
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto cs-stat-in" style={{ animationDelay: "0.3s" }}>
              Join them and be among the first to access EmpowaAI when we open our doors.
            </p>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
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
              <a href="https://github.com/EmpowaAI/EmpowerAI" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
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
              © {new Date().getFullYear()} EmpowaAI · Amandla e-Ubuntu 🇿🇦 · Built in Mzansi ·{" "}
              <a
                href="https://github.com/EmpowaAI/EmpowerAI"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
              >
                Open source (MIT)
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
