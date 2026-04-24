import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import DemoSection from "@/components/DemoSection";

const logoSrc = `${import.meta.env.BASE_URL}images/empowa_icon.png`;

export default function Demo() {
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
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to site
              </Link>
            </Button>
            <ProfileMenu />
            <Button asChild variant="cta" size="sm" className="shimmer">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border/60 bg-muted/40 py-8 sm:py-10">
          <div className="container">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-secondary sm:hidden"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary sm:mt-0">
              Interactive demo
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl md:text-4xl">
              Try EmpowAI in 60 seconds
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              CV Analyser is Mahala — always free. See the full 5-path flow, then unlock Premium on the pricing page when
              you&apos;re ready.
            </p>
          </div>
        </section>

        <DemoSection />
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
}
