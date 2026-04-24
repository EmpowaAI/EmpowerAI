import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import DemoSection from "@/components/DemoSection";
import { Menu, X } from "lucide-react";

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
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-lg border-b border-border/60 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <nav className="container py-8 flex flex-col gap-6">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary">
                Home
              </Link>
              <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary">
                Pricing
              </Link>
              <div className="flex flex-col gap-3 pt-6 border-t border-border/40">
                <Button asChild variant="outline" className="w-full h-12 text-lg" onClick={() => setIsMenuOpen(false)}>
                  <Link to="/">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to site
                  </Link>
                </Button>
                <Button asChild variant="cta" className="w-full h-12 text-lg shimmer" onClick={() => setIsMenuOpen(false)}>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
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
