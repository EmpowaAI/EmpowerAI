import { useState } from "react";
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
  Twitter,
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
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { cn } from "@/lib/utils";
import { ContactWidget } from "@/components/ContactWidget";
import { Link } from "react-router-dom";
import { ConsentBanner } from "@/components/ConsentBanner";
import siyanda from "../assets/images/siyaimage.png";

const logoSrc = `${import.meta.env.BASE_URL}images/empowa_icon.png`;
const heroBg = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Ubuntu Stories", href: "#ubuntu-stories" },
    { label: "Demo", href: "/demo", route: true },
    { label: "Pricing", href: "/pricing", route: true },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logoSrc}
              alt="EmpowAI logo"
              className="h-9 w-9 rounded-md object-cover"
              width={36}
              height={36}
            />
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              EmpowAI
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) =>
              l.route ? (
                <Link key={l.label} to={l.href} className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
                  {l.label}
                </a>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu />
            <Button asChild variant="cta" size="sm" className="hidden sm:inline-flex shimmer">
              <Link to="/login">Get Started</Link>
            </Button>

            {/* Cool Hamburger Toggle */}
            <button 
              className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-md transition-smooth active:scale-90"
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
            {navLinks.map((l) => (
              l.route ? (
                <Link key={l.label} to={l.href} onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold text-primary hover:text-secondary transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold text-primary hover:text-secondary transition-colors">
                  {l.label}
                </a>
              )
            ))}
            <div className="flex flex-col w-full gap-4 pt-8 border-t border-border/40">
              <Button asChild variant="cta" size="xl" className="w-full rounded-2xl shimmer" onClick={() => setIsMenuOpen(false)}>
                <Link to="/login">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="ai-mesh ai-spotlight grain relative overflow-hidden text-white">
          <img
            src={heroBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,hsl(220_60%_6%/0.7),hsl(220_60%_8%/0.35)_30%,hsl(220_60%_8%/0.4)_65%,hsl(220_60%_5%/0.75))]"
            aria-hidden
          />
          <div className="ai-grid absolute inset-0 opacity-50" aria-hidden />

          <div className="container relative py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center animate-fade-up">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Amandla e-Ubuntu
                <span className="text-base leading-none">🇿🇦</span>
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] drop-shadow-sm md:text-6xl lg:text-7xl">
                Your Future,{" "}
                <span className="text-gradient-ai">Powered by AI</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/90 md:text-lg">
                Discover career pathways rooted in Ubuntu values. Join thousands
                of young South Africans building better futures.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild variant="cta" size="xl" className="shimmer w-full sm:w-auto">
                  <Link to="/login">
                    Start Your Journey
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outlineLight" size="xl" className="w-full sm:w-auto">
                  <Link to="/demo">
                    <Play className="mr-1 h-4 w-4" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/80">
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

        {/* ===== Trust strip ===== */}
        <section className="border-b border-border bg-background">
          <div className="container grid grid-cols-1 gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              { icon: Rocket, title: "AI-powered career", sub: "guidance in 60 seconds" },
              { icon: HeartHandshake, title: "Rooted in", sub: "Ubuntu values" },
              { icon: Briefcase, title: "Personalized pathways", sub: "to income growth" },
              { icon: Star, title: "Trusted by 2,000+ youth", sub: "Rated 4.9/5" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3 transition-smooth hover:translate-x-1">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-smooth hover:scale-110 hover:bg-secondary hover:text-secondary-foreground">
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="text-sm leading-snug">
                  <div className="font-semibold text-primary">{title}</div>
                  <div className="text-muted-foreground">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Featured story (mirrors live site layout) ===== */}
        <section id="ubuntu-stories" className="bg-muted/50 py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Featured Story
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary md:text-5xl">
                Siyanda's Journey: from R0 to R4,500/month
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">He didn't get lucky — he explored, compared, and chose. Here's exactly how it went.</p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
              {/* LEFT — Profile + transformation card */}
              <Card className="relative overflow-hidden border-border/70 bg-card p-6 shadow-card-soft md:p-7">
                {/* Mahala badge */}
                <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  <Zap className="h-3 w-3" />
                  CV Analyser · Mahala
                </div>

                {/* Profile header */}
                <div className="flex items-start gap-4">
                  <img
                    src={siyanda}
                    alt="Portrait of Siyanda Nkosi"
                    width={64}
                    height={64}
                    loading="lazy"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-secondary/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-primary">
                      Siyanda Nkosi, 22
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Boksburg, Gauteng
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Empowerment Score
                    </div>
                    <div className="font-display text-2xl font-bold text-primary">
                      78<span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>

                {/* Income transformation */}
                <div className="mt-6 rounded-xl border border-border/70 bg-background p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                    Income Transformation
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Before</div>
                      <div className="mt-1 font-display text-2xl font-bold text-muted-foreground line-through">
                        R0
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="text-xs text-muted-foreground">After</div>
                      <div className="mt-1 font-display text-2xl font-bold text-secondary">
                        R4,500<span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat tiles */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { v: "5", l: "Paths Explored" },
                    { v: "6 wks", l: "To First Gig" },
                    { v: "95%", l: "Match Rate" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-lg bg-accent/50 p-3 text-center"
                    >
                      <div className="font-display text-xl font-bold text-primary">
                        {s.v}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer rows */}
                <div className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Top Path</span>
                    <span className="font-semibold text-primary">Tech Skills</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Chosen after exploring 5 careers</span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-secondary" />
                      CV analysed in 60s
                    </span>
                  </div>
                </div>
              </Card>

              {/* RIGHT — 5-step journey */}
              <div className="flex flex-col">
                <Card className="border-border/70 bg-card p-6 shadow-card-soft md:p-7">
                  <h3 className="font-display text-xl font-bold text-primary">
                    The 5-step journey
                  </h3>
                  <ol className="mt-5 space-y-3.5">
                    {[
                      { t: "Uploaded CV", d: "Analyzed in 60 seconds" },
                      { t: "Explored 5 Paths", d: "Tech, Trades, SMME, Gov, Creative" },
                      { t: "Chose Tech Skills", d: "95% match — best fit" },
                      { t: "Hired in 6 weeks", d: "Junior dev, remote-friendly" },
                      { t: "R4,500/month", d: "Up from R0 — and growing" },
                    ].map((step, i) => (
                      <li
                        key={step.t}
                        className="flex gap-4 rounded-xl border border-border/60 bg-background/70 px-4 py-3"
                      >
                        <div className="flex flex-col items-center">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground shadow-sm">
                            {i + 1}
                          </span>
                          {i < 4 && (
                            <span className="mt-1 h-full w-px flex-1 bg-border/80" />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="font-semibold leading-tight text-primary">{step.t}</div>
                          <div className="mt-1 text-sm leading-snug text-muted-foreground">{step.d}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>

                {/* Quote */}
                <div className="mt-5 rounded-xl border border-border/70 border-l-4 border-l-secondary bg-card p-5 shadow-card-soft">
                  <Quote className="h-5 w-5 text-secondary" />
                  <p className="mt-2 font-display italic text-primary">
                    "EmpowAI taught me that ubuntu is a business strategy."
                  </p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Siyanda <span className="text-secondary">·</span> Featured story
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Izinsiza Zethu — Our Tools
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Three simple steps to discover your career potential.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { n: "01", icon: Upload, title: "Upload Your CV", desc: "Drop your CV — or build one with us in minutes." },
                { n: "02", icon: Gauge, title: "Get Your Score", desc: "AI reveals your Empowerment Score and gaps." },
                { n: "03", icon: Compass, title: "Explore Career Paths", desc: "Compare 5+ paths with real income projections." },
              ].map(({ n, icon: Icon, title, desc }) => (
                <Card
                  key={title}
                  className="card-glow group relative overflow-hidden border-border/70 bg-card p-7 text-center shadow-card-soft"
                >
                  <span className="pointer-events-none absolute right-4 top-3 font-display text-5xl font-extrabold text-primary/5 transition-transform duration-500 group-hover:scale-125 group-hover:text-secondary/10">
                    {n}
                  </span>
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-500 group-hover:rotate-6 group-hover:bg-secondary group-hover:shadow-cta">
                    <Icon className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" strokeWidth={2.2} />
                  </div>
                  <h3 className="relative mt-5 font-display text-base font-bold text-primary">{title}</h3>
                  <p className="relative mt-2 text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Button asChild variant="cta" size="xl" className="shimmer">
                <Link to="/login">
                  Start Your Journey
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ===== Mzansi testimonials ===== */}
        <section className="bg-muted/40 py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Izindaba Zempumelelo — Ubuntu Stories
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
                Real Success Stories from Mzansi
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                See how EmpowAI is transforming careers across all 9 provinces.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { initials: "LM", name: "Lerato Mokoena", loc: "Cape Town, WC", quote: "From Khayelitsha to a junior dev role. EmpowAI showed me tech skills I didn't know I had. Siyabonga!", earn: "R12,000/mo", path: "Student → Software Developer" },
                { initials: "SK", name: "Sipho Khumalo", loc: "Durban, KZN", quote: "The simulation showed me entrepreneurship was my path. Now I run my own spaza shop AND a marketing agency!", earn: "R18,500/mo", path: "Unemployed → Business Owner" },
                { initials: "NT", name: "Nomsa Tshabalala", loc: "Johannesburg, GP", quote: "From minimum wage to a career I love. The AI actually understood my reality as a young South African.", earn: "R15,000/mo", path: "Waitress → Marketing Pro" },
              ].map((t) => (
                <Card key={t.name} className="card-glow border-border/70 bg-card p-6 shadow-card-soft">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground transition-transform duration-300 hover:scale-110 hover:rotate-6">
                      {t.initials}
                    </span>
                    <div>
                      <div className="font-bold text-primary">{t.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {t.loc}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm italic text-muted-foreground">"{t.quote}"</p>
                  <div className="mt-4 rounded-md bg-accent/50 p-3 text-sm">
                    <div className="text-xs text-muted-foreground">💰 Current Earnings</div>
                    <div className="font-bold text-primary">{t.earn}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{t.path}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Siyaqala band ===== */}
        <section className="relative overflow-hidden border-t border-border bg-primary py-14 text-center text-primary-foreground">
          <div className="ai-mesh absolute inset-0" aria-hidden />
          <div className="container relative">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Siyaqala! — Let's Begin
            </span>
            <p className="mt-3 font-display text-2xl italic md:text-3xl">
              Join over <span className="text-gradient-ai font-bold not-italic">2,000+</span> young South Africans
              building better careers with AI. Together, we rise. 🇿🇦
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild variant="cta" size="xl" className="shimmer">
                <Link to="/login">
                  Start Your Journey
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border bg-background">
        <div className="container flex flex-col items-center justify-between gap-6 py-7 md:flex-row">
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm">
            {[
              { label: "Ubuntu Stories", href: "#ubuntu-stories" },
              { label: "Demo", href: "/demo" },
              { label: "Pricing", href: "/pricing" },
            ].map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="font-semibold text-primary underline-offset-4 hover:text-secondary hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {[Facebook, Twitter, Mail, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href={Icon === Mail ? "mailto:info@empowa-ai.co.za" : "#"}
                aria-label="social link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-secondary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦 · Built in Mzansi
        </div>
      </footer>

      <ContactWidget />
      <ConsentBanner />
    </div>
  );
}
