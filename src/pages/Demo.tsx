import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Moon,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import logo from "/empowerLogo.jpg";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/demo", active: true },
  { label: "CV Analyzer", icon: ClipboardCheck, to: "/cv-analyzer" },
  { label: "Digital Twin", icon: Bot, to: "/digital-twin" },
  { label: "Opportunities", icon: BriefcaseBusiness, to: "/features" },
];

const primaryActions = [
  {
    icon: ClipboardCheck,
    title: "Analyse CV",
    text: "Find strengths, proof gaps, and your next best move.",
    cta: "Improve CV",
    to: "/cv-analyzer",
  },
  {
    icon: Bot,
    title: "Digital Twin",
    text: "Build your AI career profile from real evidence.",
    cta: "Build twin",
    to: "/digital-twin",
  },
  {
    icon: BriefcaseBusiness,
    title: "Find Opportunities",
    text: "Explore jobs, learnerships, funding, and starter ventures.",
    cta: "Explore",
    to: "/features",
  },
];

const quietStats = [
  { label: "CV strength", value: "0", note: "Analyse your CV first" },
  { label: "Readiness", value: "0", note: "Build your twin next" },
  { label: "Live opportunities", value: "7,564", note: "South Africa" },
];

const journeySteps = [
  { title: "Analyse your CV", status: "Start here", active: true },
  { title: "Build your Digital Twin", status: "Next" },
  { title: "Choose a path", status: "Jobs · study · income" },
  { title: "Apply with confidence", status: "When ready" },
];

const onboardingSteps = [
  {
    icon: FileText,
    title: "Upload CV",
    text: "Start with your CV so EmpowAI can understand your real skills.",
    to: "/cv-analyzer",
  },
  {
    icon: Bot,
    title: "Create Twin",
    text: "Turn your experience into a clear career and income profile.",
    to: "/digital-twin",
  },
  {
    icon: Compass,
    title: "Explore Path",
    text: "See jobs, study options, funding, and side-income ideas that fit you.",
    to: "/features",
  },
];

const Demo = () => {
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EmpowAI logo" className="h-10 w-10 rounded-md object-cover" width={40} height={40} />
            <span className="font-display text-2xl font-bold text-primary">EmpowAI</span>
          </Link>

          <nav className="order-3 flex w-full justify-start overflow-x-auto rounded-xl bg-muted/60 p-1 md:order-2 md:w-auto">
            {navItems.map(({ label, icon: Icon, to, active }) => (
              <Link
                key={label}
                to={to}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="order-2 flex items-center gap-2 md:order-3">
            <ProfileMenu />
            <Button variant="ghost" size="icon" aria-label="Toggle theme preview">
              <Moon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="bg-gradient-to-b from-muted/35 via-background to-background">
        <section className="container py-8 md:py-10">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.45fr_0.85fr]">
            <div className="space-y-6">
              {showWelcomeGuide && (
                <Card className="relative overflow-hidden border-primary/20 bg-card p-6 shadow-card-soft md:p-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-primary hover:bg-muted"
                    aria-label="Close welcome guide"
                    onClick={() => setShowWelcomeGuide(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="pr-10">
                    <h1 className="font-display text-2xl font-bold text-primary md:text-3xl">Welcome to EmpowerAI! 🚀</h1>
                    <p className="mt-2 text-sm font-semibold text-muted-foreground md:text-base">
                      Let&apos;s get you started. Here&apos;s your journey to career empowerment:
                    </p>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start">
                    {onboardingSteps.map(({ icon: Icon, title, text, to }, index) => (
                      <div key={title} className="contents">
                        <Link to={to} className="group text-center transition-smooth hover:-translate-y-0.5">
                          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-sm">
                            <Icon className="h-9 w-9" />
                            <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                              {index + 1}
                            </span>
                          </div>
                          <h2 className="mt-5 font-display text-xl font-bold text-primary">Step {index + 1}: {title}</h2>
                          <p className="mx-auto mt-2 max-w-64 text-sm leading-6 text-muted-foreground">{text}</p>
                        </Link>
                        {index < onboardingSteps.length - 1 && (
                          <span className="mt-10 hidden h-0.5 w-10 rounded-full bg-primary/25 md:block" aria-hidden="true" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <p>
                      <span className="font-bold">💡 Pro Tip:</span> Your CV is the foundation of everything. The more complete and detailed, the better our AI can help you!
                    </p>
                  </div>
                </Card>
              )}

              <Card className="overflow-hidden border-border/70 bg-card p-6 shadow-card-soft md:p-8">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-secondary">
                    <Sparkles className="h-3.5 w-3.5" /> AI Command Centre
                  </span>
                  <span>Updated just now</span>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-primary md:text-6xl">
                      Welcome back, Nicolette
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                      Your path starts with one clear step: analyse your CV so EmpowAI can guide you toward jobs, study funding, side income, and business ideas that fit your real skills.
                    </p>
                  </div>
                  <Button asChild variant="cta" size="lg" className="shimmer w-full md:w-auto">
                    <Link to="/cv-analyzer">
                      Start with my CV
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>

              <Card className="border-secondary/25 bg-secondary/5 p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                      <Target className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-secondary">Recommended next step</p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-primary">Analyse CV</h2>
                      <p className="mt-1 text-sm text-muted-foreground">This unlocks stronger guidance and makes every next recommendation more personal.</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="shrink-0 border-secondary/40 text-secondary hover:bg-secondary/10">
                    <Link to="/cv-analyzer">Improve CV</Link>
                  </Button>
                </div>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                {quietStats.map((stat) => (
                  <Card key={stat.label} className="border-border/70 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className="mt-4 font-display text-4xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.note}</p>
                  </Card>
                ))}
              </div>

              <Card className="border-border/70 p-5 shadow-sm md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-primary">Your AI Journey</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Simple, calm, and one action at a time.</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">0% complete</span>
                </div>
                <div className="mt-6 space-y-3">
                  {journeySteps.map((step, index) => (
                    <Link
                      key={step.title}
                      to={index === 0 ? "/cv-analyzer" : index === 1 ? "/digital-twin" : "/features"}
                      className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                        step.active ? "border-secondary/35 bg-secondary/5" : "border-border/70 bg-background hover:border-primary/30"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-semibold text-foreground">{step.title}</span>
                      </span>
                      <span className="text-right text-xs font-semibold text-muted-foreground">{step.status}</span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <Card className="border-border/70 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Compass className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-primary">Profile snapshot</h2>
                    <p className="text-xs text-muted-foreground">South Africa · Professional growth</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">Top skills</p>
                    <p className="text-muted-foreground">No skills detected yet</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Twin status</p>
                    <p className="text-muted-foreground">Not built yet</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                {primaryActions.map(({ icon: Icon, title, text, cta, to }) => (
                  <Card key={title} className="border-border/70 p-5 shadow-sm transition-smooth hover:border-primary/30">
                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-bold text-primary">{title}</h3>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p>
                        <Button asChild variant="link" className="mt-2 h-auto p-0 text-secondary">
                          <Link to={to}>{cta}</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="border-primary/20 bg-primary/5 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-semibold text-primary">AI Twin ready when you are</p>
                    <p className="mt-1 text-sm text-muted-foreground">We keep the dashboard quiet until your CV gives us better evidence.</p>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </section>
      </main>

      <ContactWidget />
    </div>
  );
};

export default Demo;