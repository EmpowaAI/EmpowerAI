import { Link } from "react-router-dom";
import { useState } from "react"; // Added import
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
  Zap,
  MapPin,
  Quote,
  TrendingUp,
  Menu, // Added import
  X, // Added import
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import siyanda from "../assets/images/siyaimage.png";
import Logo from "@/components/ui/Logo";
import TikTokIcon from "@/components/ui/TikTokIcon";
import { cn } from "@/lib/utils"; // Added import

const heroBackgroundUrl = encodeURI(`${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/10 bg-background">
        {/* State for mobile menu */}
        <div className="container flex h-16 items-center justify-between gap-4">
          <Logo variant="default" size="sm" linkTo="" />

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#ubuntu-stories" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Ubuntu Stories</a>
            <Link to="/demo" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Demo</Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu />
            <Button asChild variant="cta" size="sm" className="hidden md:flex shimmer">
              <Link to="/signup">Get Started</Link>
            </Button>

            {/* Hamburger Toggle */}
            <button
              className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-md transition-smooth"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={cn(
          "md:hidden fixed inset-x-0 top-16 z-50 bg-background border-b border-border/20 transition-all duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
        )}>
          <nav className="container py-6 px-4 flex flex-col items-center gap-2">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Features", href: "#features" },
              { label: "Ubuntu Stories", href: "#ubuntu-stories" },
              { label: "Demo", href: "/demo", route: true },
            ].map((l) =>
              l.route ? (
                <Link key={l.label} to={l.href} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-secondary transition-colors py-2 px-4 rounded-lg hover:bg-primary/5 w-full text-center">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-secondary transition-colors py-2 px-4 rounded-lg hover:bg-primary/5 w-full text-center">
                  {l.label}
                </a>
              )
            )}
            <div className="flex flex-col w-full gap-3 pt-4 mt-2 border-t border-border/30">
              <Button asChild variant="cta" size="lg" className="w-full rounded-xl shimmer" onClick={() => setIsMenuOpen(false)}>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>

              </header>

      <main>
        <section className="relative overflow-hidden text-white">
          <img
            src={heroBackgroundUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,hsl(220_60%_6%/0.45),hsl(220_60%_8%/0.20)_30%,hsl(220_60%_8%/0.26)_65%,hsl(220_60%_5%/0.55))]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 ai-mesh opacity-35" aria-hidden />
          <div className="pointer-events-none absolute inset-0 hero-spotlight" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grain" aria-hidden />

          <div className="container relative z-10 py-16 md:py-24 lg:py-28">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Left — copy */}
              <div className="text-center lg:text-left animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  Amandla e-Ubuntu
                  <span className="text-base leading-none emoji">🇿🇦</span>
                </div>

                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] drop-shadow-sm md:text-5xl lg:text-6xl">
                  Your Future,{" "}
                  <span className="text-gradient-ai whitespace-nowrap">Powered by AI</span>
                </h1>
                <p className="mt-5 max-w-xl text-base text-white/90 md:text-lg lg:max-w-none">
                  Upload your CV, get your Empowerment Score, and discover career pathways built for young South Africans — free, in 60 seconds.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Button asChild variant="cta" size="xl" className="shimmer w-full sm:w-auto shadow-[0_0_24px_rgba(255,107,35,0.45)] hover:shadow-[0_0_36px_rgba(255,107,35,0.6)]">
                    <Link to="/signup">
                      Start Free — No CV? No problem
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outlineLight" size="xl" className="w-full sm:w-auto opacity-80 hover:opacity-100">
                    <Link to="/demo">
                      <Play className="mr-1 h-4 w-4" />
                      See Demo
                    </Link>
                  </Button>
                </div>

                {/* Trust strip — right under CTAs */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70 lg:justify-start">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                    2,000+ youth helped
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-secondary" />
                    Rated 4.9 / 5
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                    All 9 provinces
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-secondary" />
                    60-second analysis
                  </span>
                </div>
              </div>

              {/* Right — product mockup card */}
              <div className="hidden lg:block animate-fade-up" style={{ animationDelay: "120ms" }}>
                <div className="relative mx-auto w-full max-w-sm">
                  {/* Glow ring */}
                  <div className="absolute -inset-4 rounded-3xl bg-secondary/20 blur-2xl" aria-hidden />
                  <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80 text-white">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Economic Twin</div>
                          <div className="text-[10px] text-white/60">Live profile</div>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        Active
                      </span>
                    </div>

                    {/* Score ring */}
                    <div className="mt-4 flex items-center gap-4">
                      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-secondary/60 bg-white/5">
                        <div className="text-center">
                          <div className="font-display text-2xl font-bold text-white">78</div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider text-white/60">Score</div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="mb-1 flex justify-between text-[10px] text-white/70">
                            <span>Employability</span><span className="text-secondary font-semibold">78%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[78%] rounded-full bg-secondary" />
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex justify-between text-[10px] text-white/70">
                            <span>Market demand</span><span className="text-green-400 font-semibold">High</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[85%] rounded-full bg-green-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-4">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-2">Core skills matched</div>
                      <div className="flex flex-wrap gap-1.5">
                        {["React", "Node.js", "Python", "SQL", "AWS"].map((s) => (
                          <span key={s} className="rounded-full border border-secondary/40 bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Matched job */}
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">Top matched role</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">Junior Developer</div>
                          <div className="text-[10px] text-white/60 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> Remote · Gauteng</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-secondary">R15,000</div>
                          <div className="text-[10px] text-white/60">/month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        <section id="ubuntu-stories" className="bg-muted/50 py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Featured Story</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary md:text-5xl">
                Siyanda&apos;s Journey: from R0 to R4,500/month
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                He didn't get lucky — he explored, compared, and chose. Here's exactly how it went.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
              <Card className="relative overflow-hidden border-border/70 bg-card p-6 shadow-card-soft md:p-7">
                <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  <Zap className="h-3 w-3" />
                  CV Analyser · Mahala
                </div>

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
                    <h3 className="font-display text-lg font-bold text-primary">Siyanda Nkosi, 22</h3>
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

                <div className="mt-6 rounded-xl border border-border/70 bg-background p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                    Income Transformation
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Before</div>
                      <div className="mt-1 font-display text-2xl font-bold text-muted-foreground line-through">R0</div>
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

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { v: "5", l: "Paths Explored" },
                    { v: "6 wks", l: "To First Gig" },
                    { v: "95%", l: "Match Rate" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg bg-accent/50 p-3 text-center">
                      <div className="font-display text-xl font-bold text-primary">{s.v}</div>
                      <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{s.l}</div>
                    </div>
                  ))}
                </div>

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

              <div className="flex flex-col">
                <Card className="border-border/70 bg-card p-6 shadow-card-soft md:p-7">
                  <h3 className="font-display text-xl font-bold text-primary">The 5-step journey</h3>
                  <ol className="mt-5 space-y-3.5">
                    {[
                      { t: "Uploaded CV", d: "Analyzed in 60 seconds" },
                      { t: "Explored 5 Paths", d: "Tech, Trades, SMME, Gov, Creative" },
                      { t: "Chose Tech Skills", d: "95% match — best fit" },
                      { t: "Hired in 6 weeks", d: "Junior dev, remote-friendly" },
                      { t: "R4,500/month", d: "Up from R0 — and growing" },
                    ].map((step, i) => (
                      <li key={step.t} className="flex gap-4 rounded-xl border border-border/60 bg-background/70 px-4 py-3">
                        <div className="flex flex-col items-center">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground shadow-sm">
                            {i + 1}
                          </span>
                          {i < 4 && <span className="mt-1 h-full w-px flex-1 bg-border/80" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="font-semibold leading-tight text-primary">{step.t}</div>
                          <div className="mt-1 text-sm leading-snug text-muted-foreground">{step.d}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>

                <div className="mt-5 rounded-xl border border-border/70 border-l-4 border-l-secondary bg-card p-5 shadow-card-soft">
                  <Quote className="h-5 w-5 text-secondary" />
                  <p className="mt-2 font-display italic text-primary">
                    &quot;EmpowAI taught me that ubuntu is a business strategy.&quot;
                  </p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Siyanda <span className="text-secondary">·</span> Featured story
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div id="features" className="container scroll-mt-24">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Izinsiza Zethu — Our Tools
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">How It Works</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Three simple steps to discover your career potential.</p>
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
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Izindaba Zempumelelo — Ubuntu Stories
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">Real Success Stories from Mzansi</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                See how EmpowAI is transforming careers across all 9 provinces.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
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
                  quote:
                    "The simulation showed me entrepreneurship was my path. Now I run my own spaza shop AND a marketing agency!",
                  earn: "R18,500/mo",
                  path: "Unemployed → Business Owner",
                },
                {
                  initials: "NT",
                  name: "Nomsa Tshabalala",
                  loc: "Johannesburg, GP",
                  quote:
                    "From minimum wage to a career I love. The AI actually understood my reality as a young South African.",
                  earn: "R15,000/mo",
                  path: "Waitress → Marketing Pro",
                },
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
                  <p className="mt-4 text-sm italic text-muted-foreground">&quot;{t.quote}&quot;</p>
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

        {/* FAQ */}
        <section className="py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Got questions?</span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto mt-10 max-w-2xl space-y-3">
              {[
                {
                  q: "Is EmpowAI free to use?",
                  a: "Yes — the CV analyser, Empowerment Score, and career path explorer are completely free (mahala). Advanced simulations and AI coaching are available on a premium tier.",
                },
                {
                  q: "Do I need a CV to get started?",
                  a: "No. You can paste your work history as text, upload a PDF or Word file, or answer a few quick questions and we'll build a starter CV with you.",
                },
                {
                  q: "Is my data safe?",
                  a: "All CV data is encrypted at rest using AES-256. We never sell your data. You can delete your profile at any time from the account settings page.",
                },
                {
                  q: "Which provinces and cities does EmpowAI cover?",
                  a: "All 9 provinces — from Gauteng and Western Cape to Limpopo and the Northern Cape. Opportunities and salary projections are localised to your area.",
                },
                {
                  q: "What is an Economic Twin?",
                  a: "Your Economic Twin is an AI-generated career profile built from your CV. It shows your Empowerment Score, matched job titles, income potential, skill gaps, and personalised recommendations — all in one place.",
                },
                {
                  q: "How long does the CV analysis take?",
                  a: "Typically under 60 seconds. The AI extracts your skills, scores your employability, identifies gaps, and matches you to live opportunities automatically.",
                },
              ].map(({ q, a }) => (
                <details key={q} className="group rounded-xl border border-border bg-card shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-primary [&::-webkit-details-marker]:hidden">
                    {q}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-open:rotate-45">
                      <ArrowRight className="h-3.5 w-3.5 rotate-[-45deg] group-open:rotate-0 transition-transform duration-200" />
                    </span>
                  </summary>
                  <div className="border-t border-border px-5 pb-4 pt-3 text-sm text-muted-foreground leading-relaxed">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-border bg-primary py-14 text-center text-primary-foreground">
          <div className="ai-mesh absolute inset-0" aria-hidden />
          <div className="container relative">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Siyaqala! — Let&apos;s Begin</span>
            <p className="mt-3 font-display text-2xl italic md:text-3xl">
              Join over <span className="text-gradient-ai font-bold not-italic">2,000+</span> young South Africans building better
              careers with AI. Together, we rise. <span className="emoji">🇿🇦</span>
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild variant="cta" size="xl" className="shimmer">
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Logo variant="default" size="sm" linkTo="" />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
                AI-powered career guidance rooted in Ubuntu values. Free for every young South African — from Limpopo to the Western Cape.
              </p>
              <div className="mt-4 flex items-center gap-2">
                {[
                  { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61562941456913", label: "Facebook" },
                  { Icon: TikTokIcon, href: "https://www.tiktok.com/@empowa.ai", label: "TikTok" },
                  { Icon: Instagram, href: "https://www.instagram.com/empowa.ai/", label: "Instagram" },
                  { Icon: Linkedin, href: "https://www.linkedin.com/company/empowaai", label: "LinkedIn" },
                  { Icon: Mail, href: "mailto:info@empowa-ai.co.za", label: "Email" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Features", href: "#features" },
                  { label: "Ubuntu Stories", href: "#ubuntu-stories" },
                  { label: "Demo", href: "/demo", route: true },
                  { label: "Pricing", href: "/pricing", route: true },
                ].map((l) => (
                  <li key={l.label}>
                    {"route" in l && l.route ? (
                      <Link to={l.href} className="text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                    ) : (
                      <a href={l.href} className="text-muted-foreground hover:text-primary transition-colors">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:info@empowa-ai.co.za" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="mailto:info@empowa-ai.co.za" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="mailto:info@empowa-ai.co.za" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
                <li>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-600 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    All systems operational
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu <span className="emoji">🇿🇦</span> · Built in Mzansi
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
}
