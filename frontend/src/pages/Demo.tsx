import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";
import DemoSection from "../components/DemoSection";
import logo from "../assets/images/empowerLogo.jpg";

export default function Demo() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EmpowAI logo" className="h-9 w-9 rounded-md object-cover" width={36} height={36} />
            <span className="font-display text-xl font-bold tracking-tight text-primary">EmpowAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />Back to site
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="cta" size="sm" className="shimmer">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border/60 bg-muted/40 py-8 sm:py-10">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-all hover:text-secondary sm:hidden">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary sm:mt-0">
              Interactive demo
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl md:text-4xl">
              Try EmpowAI in 60 seconds
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              No sign-up. No download. Just tap through Siyanda's real journey and see how the AI matches paths to people.
            </p>
          </div>
        </section>
        <DemoSection />
      </main>
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦
        </div>
      </footer>
    </div>
  );
}