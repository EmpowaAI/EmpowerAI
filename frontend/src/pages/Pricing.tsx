import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  HeadphonesIcon,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import { UpgradeModal } from "@/components/UpgradeModal";

const logoSrc = `${import.meta.env.BASE_URL}images/empowa_icon.png`;

const FREE_FEATURES = [
  "CV Analyser — always Mahala",
  "Empowerment Score (out of 100)",
  "60-second AI insights",
  "Sample career path preview",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Full 5-path career matching",
  "Personalised learning roadmap",
  "Mentor & gig matching",
  "Income projections + monthly check-ins",
  "Priority WhatsApp support",
  "POPIA-compliant data export",
];

const FAQS = [
  {
    q: "Is the CV Analyser really free?",
    a: "Yes — for life. You can upload your CV, get your Empowerment Score, and preview one path without paying a cent.",
  },
  {
    q: "How do I pay?",
    a: "We accept South African cards via Paystack or Yoco. Subscriptions renew monthly and you can cancel anytime from your profile menu.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep Premium access until the end of your billing period, then you drop back to the free CV Analyser. No fees, no penalties.",
  },
  {
    q: "Can I expense it for my school or NGO?",
    a: "Yebo. Email support@empowa.org for invoicing, group discounts and bulk seats.",
  },
];

export default function Pricing() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoSrc} alt="EmpowAI logo" className="h-9 w-9 object-contain" width={36} height={36} />
            <span className="font-display text-xl font-bold tracking-tight text-primary">EmpowAI</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Home
            </Link>
            <Link to="/demo" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Demo
            </Link>
            <Link to="/pricing" className="text-sm font-semibold text-primary">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main>
        <section className="ai-mesh relative overflow-hidden border-b border-border/60 bg-muted/40 py-14 sm:py-20">
          <div className="container relative text-center">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-secondary sm:hidden"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
              <Sparkles className="h-3 w-3" />
              Pricing
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
              One simple plan. Mahala forever for CV Analyser.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              No tricks, no surprise fees. Pay R50 a month for everything else — or stick with the free analyser for as long
              as you like.
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="container">
            <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
              <Card className="relative flex flex-col border-border/70 bg-card p-7 shadow-card-soft">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  Free · Mahala
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold text-primary">R0</span>
                  <span className="text-sm text-muted-foreground">forever</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get your career direction with zero cost. Perfect for first-time job seekers.
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant="outline" size="lg" className="mt-7">
                  <Link to="/demo">Try the CV Analyser</Link>
                </Button>
              </Card>

              <Card className="relative flex flex-col overflow-hidden border-secondary/40 bg-card p-7 shadow-glow ring-1 ring-secondary/30">
                <div className="absolute right-5 top-5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-foreground">
                    Most popular
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold text-primary">R50</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unlock the full toolkit — pathways, mentors, roadmaps and gigs.
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="cta" size="lg" className="shimmer mt-7" onClick={() => setUpgradeOpen(true)}>
                  <Sparkles className="mr-1 h-4 w-4" />
                  Upgrade for R50/mo
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">Cancel anytime · Paystack / Yoco</p>
              </Card>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, t: "POPIA compliant", s: "Your data, your rules" },
                { icon: HeadphonesIcon, t: "Real human support", s: "Replies in 1 business day" },
                { icon: Rocket, t: "Built in Mzansi", s: "By young people, for young people" },
              ].map(({ icon: Icon, t, s }) => (
                <div key={t} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-primary">{t}</div>
                    <div className="text-xs text-muted-foreground">{s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/30 py-14 sm:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">Imibuzo Evamile</span>
                <h2 className="mt-3 font-display text-2xl font-bold text-primary sm:text-3xl">Frequently asked</h2>
              </div>

              <div className="mt-8 space-y-3">
                {FAQS.map((f) => (
                  <details key={f.q} className="group rounded-xl border border-border/70 bg-card p-4 open:shadow-card-soft">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-primary">
                      {f.q}
                      <span className="text-secondary transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦
        </div>
      </footer>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <ContactWidget />
    </div>
  );
}
