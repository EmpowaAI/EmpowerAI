import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu"; // Added import
import { ContactWidget } from "@/components/ContactWidget";
import DemoSection from "@/components/DemoSection";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Added import

const logoSrc = `${import.meta.env.BASE_URL}images/empowa_icon.png`;

export default function Demo() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

            {/* Hamburger Toggle */}
            <button
              className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-md transition-smooth"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={cn( // Used cn for conditional classes
          "md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
        )}>
          <nav className="container py-12 flex flex-col items-center gap-8">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold text-primary hover:text-secondary transition-colors">
              Home
            </Link>
            <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-3xl font-display font-bold text-primary hover:text-secondary transition-colors">
              Pricing
            </Link>
            <div className="flex flex-col w-full gap-4 pt-8 border-t border-border/40">
              <Button asChild variant="outline" size="xl" className="w-full rounded-2xl" onClick={() => setIsMenuOpen(false)}>
                <Link to="/">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to site
                </Link>
              </Button> {/* Changed to size="xl" and rounded-2xl */}
              <Button asChild variant="cta" size="xl" className="w-full rounded-2xl shimmer" onClick={() => setIsMenuOpen(false)}>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
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
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu <span className="emoji">🇿🇦</span>
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
}
