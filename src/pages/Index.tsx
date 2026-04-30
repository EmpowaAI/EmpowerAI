import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
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
  Zap,
  MapPin,
  Quote,
  TrendingUp,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CareerExplorer } from "@/components/CareerExplorer";
import { ROICalculator } from "@/components/ROICalculator";
import { Link } from "react-router-dom";
import logo from "/empowerLogo.jpg";
import siyanda from "@/assets/siyanda.jpg";
import heroBg from "@/assets/hero-bg.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="EmpowAI logo"
              className="h-9 w-9 rounded-md object-cover"
              width={36}
              height={36}
            />
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              EmpowAI
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "CV Analyser", href: "/cv-analyzer", route: true },
              { label: "Features", href: "/features", route: true },
              { label: "Pricing", href: "/pricing", route: true },
              { label: "Demo", href: "/demo", route: true },
            ].map((l) =>
              l.route ? (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
                >
                  {l.label}
                </a>
              )
            )}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <ProfileMenu />
            <Button asChild variant="cta" size="sm" className="shimmer">
              <Link to="/pricing">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ===== Hero — restrained, typography-led ===== */}
        <section className="ai-mesh ai-spotlight grain relative overflow-hidden text-white">
          <img
            src={heroBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,hsl(220_60%_6%/0.78),hsl(220_60%_8%/0.55)_45%,hsl(220_60%_5%/0.85))]"
            aria-hidden
          />

          <div className="container relative py-32 md:py-48">
            <div className="mx-auto max-w-4xl text-center animate-fade-up">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/85 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Built in Mzansi · For Mzansi
              </div>

              <h1 className="mt-10 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl lg:text-[5.5rem]">
                Find your next move,
                <br />
                <span className="italic text-gradient-ai">with proof.</span>
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
                EmpowAI turns your real skills into a clear path for work, study funding, side income, business ideas, and realistic income growth.
              </p>

              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild variant="cta" size="xl" className="shimmer">
                  <Link to="/cv-analyzer">
                    Start with my CV — free
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outlineLight" size="xl">
                  <a href="#how-it-works">See the simple path</a>
                </Button>
              </div>

              <div className="mx-auto mt-8 grid max-w-2xl gap-2 text-sm text-white/75 sm:grid-cols-3">
                {["No guesswork", "No career jargon", "One step at a time"].map((item) => (
                  <div key={item} className="rounded-md border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
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
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                He didn't get lucky — he explored, compared, and chose. Here's
                exactly how it went.
              </p>
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
                    { v: "5", l: "Real Options" },
                    { v: "6 wks", l: "First Income" },
                    { v: "95%", l: "Skill Fit" },
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
                    <span>Chosen after comparing work, study and business paths</span>
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
                      { t: "CV evidence checked", d: "Skills, gaps and strengths found from the actual CV" },
                      { t: "Options compared", d: "Jobs, learnerships, bursaries, gigs and business ideas" },
                      { t: "Best path chosen", d: "Matched to what the person can realistically do next" },
                      { t: "First step taken", d: "CV improved, applications sent, skill bridge started" },
                      { t: "Income grows", d: "Small wins become a clearer future plan" },
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
                    "It did not just tell me to get a job. It showed me the next realistic move for my life."
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
                A calm path, not a confusing report
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Start with one simple action. EmpowAI reveals only what matters next, based on your real skills.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { n: "01", icon: Upload, title: "Start with your CV", desc: "Upload what you have. We read the skills and evidence already inside it." },
                { n: "02", icon: Gauge, title: "See the next best fixes", desc: "Get a simple score, clear gaps and an optional CV revamp." },
                { n: "03", icon: Compass, title: "Choose a future path", desc: "Compare jobs, funding, learning, gigs and business routes with income projections." },
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
                <Link to="/cv-analyzer">
                  Start with my CV
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ===== Interactive career explorer ===== */}
        <CareerExplorer />

        {/* ===== ROI calculator ===== */}
        <ROICalculator />

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
                  { initials: "LM", name: "Lerato Mokoena", loc: "Cape Town, WC", quote: "EmpowAI showed me which skills in my CV could lead to an internship and which course would strengthen my application.", earn: "R12,000/mo", path: "Student → Software Developer" },
                  { initials: "SK", name: "Sipho Khumalo", loc: "Durban, KZN", quote: "It helped me see that my sales experience could become a small service business while I kept applying for formal work.", earn: "R18,500/mo", path: "Unemployed → Business Owner" },
                  { initials: "NT", name: "Nomsa Tshabalala", loc: "Johannesburg, GP", quote: "The advice felt personal. It gave me job options, bursary ideas and the income steps I could work toward.", earn: "R15,000/mo", path: "Waitress → Marketing Pro" },
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
              Your future should not feel like a maze. Start with one step, then let EmpowAI guide the next one. 🇿🇦
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild variant="cta" size="xl" className="shimmer">
                <Link to="/cv-analyzer">
                  Start with my CV
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
              { label: "Features", href: "#features" },
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
                href="#"
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
    </div>
  );
};

export default Index;
