import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileSearch,
  Compass,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Lock,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import logo from "/empowerLogo.jpg";

const CORE_FEATURES = [
  {
    icon: FileSearch,
      title: "CV Analyser",
      tag: "Free forever",
      description:
        "Upload your CV and get skill-based guidance that separates proven strengths from gaps that need stronger evidence.",
      bullets: ["Real CV evidence", "ATS keyword check", "Plain-language next steps"],
  },
  {
    icon: Compass,
      title: "Opportunity Matching",
    tag: "Premium",
    description:
        "AI maps your skills, location and ambitions to realistic opportunities — jobs, learning, funding, gigs and ventures.",
      bullets: ["Jobs and internships", "Bursaries and scholarships", "Business and freelance options"],
  },
  {
    icon: GraduationCap,
      title: "Personalised Roadmap",
    tag: "Premium",
    description:
        "A calm plan that shows what to do now, what to improve next, and what income path each step supports.",
      bullets: ["Bite-size weekly goals", "Skill bridges", "Progress check-ins"],
  },
  {
    icon: HeartHandshake,
    title: "Mentor & Gig Matching",
    tag: "Premium",
    description:
      "Get matched with mentors in your field and short gigs that build your portfolio while you study or job-hunt.",
    bullets: ["Verified SA mentors", "Remote & in-person gigs", "Intro templates included"],
  },
  {
    icon: TrendingUp,
    title: "Income Projections",
    tag: "Premium",
    description:
      "See realistic 6-, 12- and 24-month earning ranges per career path, based on local salary data.",
    bullets: ["Province-aware estimates", "Skill-premium breakdowns", "Updated monthly"],
  },
  {
    icon: MessageCircle,
    title: "Priority WhatsApp Support",
    tag: "Premium",
    description:
      "Chat to our team on WhatsApp for help with your roadmap, mentor intros or technical issues.",
    bullets: ["< 4-hour weekday replies", "Voice notes welcome", "Zulu, Xhosa, Afrikaans & English"],
  },
];

const TRUST = [
  { icon: ShieldCheck, title: "POPIA-compliant", desc: "Your data stays in SA and is yours to export or delete anytime." },
  { icon: Lock, title: "Bank-grade security", desc: "End-to-end encryption on every upload and conversation." },
  { icon: Zap, title: "Built for low data", desc: "Optimised for 3G — works on entry-level Android devices." },
  { icon: Globe, title: "Local-first", desc: "Trained on South African job market signals, not US averages." },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EmpowAI logo" className="h-9 w-9 rounded-md object-cover" width={36} height={36} />
            <span className="font-display text-xl font-bold tracking-tight text-primary">EmpowAI</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
              Home
            </Link>
            <Link to="/features" className="text-sm font-medium text-primary">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
              Pricing
            </Link>
            <Link to="/demo" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">
              Demo
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu />
            <Button asChild variant="cta" size="sm" className="shimmer">
              <Link to="/pricing">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Built for South Africa
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-primary md:text-5xl">
                Everything starts with your real skills
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                EmpowAI keeps the journey simple: analyse your CV, improve it only if needed, then build a future path across jobs, funding, learning, gigs and business opportunities.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="cta" size="lg">
                  <Link to="/demo">
                    Start with the free CV Analyser
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                    <Link to="/digital-twin">Explore Digital Twin</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Core feature grid ===== */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">Tools that guide, not overwhelm</h2>
            <p className="mt-3 text-muted-foreground">
              Each tool reveals the next useful step only when the user is ready for it.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map(({ icon: Icon, title, tag, description, bullets }) => (
              <Card
                key={title}
                className="group relative flex flex-col gap-4 border-border/60 p-6 transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={
                      tag === "Free forever"
                        ? "rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-secondary"
                        : "rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                    }
                  >
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                </div>
                <ul className="mt-auto space-y-1.5 border-t border-border/60 pt-4 text-sm">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-foreground/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* ===== Trust strip ===== */}
        <section className="border-y border-border/50 bg-muted/30 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
                Built on trust, made for Mzansi
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST.map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-border/60 p-5 text-center">
                  <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold text-primary">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="container py-16 md:py-24">
          <Card className="overflow-hidden border-primary/20 bg-cta-gradient p-10 text-center text-white md:p-14">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to find your path?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Start with the free CV Analyser. Upgrade to Premium for R50/month — cancel anytime.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/demo">
                  Run the free demo
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outlineLight">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} EmpowAI. Made with ❤️ in South Africa.</p>
          <div className="flex gap-5">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/pricing" className="hover:text-primary">Pricing</Link>
            <Link to="/demo" className="hover:text-primary">Demo</Link>
          </div>
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
};

export default Features;
