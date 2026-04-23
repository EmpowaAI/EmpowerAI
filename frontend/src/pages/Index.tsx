import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Play, MapPin, TrendingUp, Target, Upload, Quote, Brain, Menu, X, Rocket, HeartHandshake, Briefcase, Award, Cpu, Zap
} from "lucide-react";
import Button from "../components/ui/Button";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Ubuntu Stories", href: "#ubuntu-stories" },
  { label: "Demo", href: "/demo" },
];

const trustStats = [
  { icon: Rocket, label: "AI-Powered Analysis", value: "60s" },
  { icon: HeartHandshake, label: "Ubuntu Values", value: "Core" },
  { icon: Briefcase, label: "Real Opportunities", value: "Live" },
  { icon: Award, label: "Proven Success", value: "2,000+" }
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-primary">EmpowAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className={`text-sm font-medium transition-colors ${scrolled ? "text-foreground/80 hover:text-primary" : "text-white/80 hover:text-white"}`}
              >
                {link.label}
              </a>
            )}
          </nav>
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className={`text-sm font-medium px-3 py-2 transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}>
              Sign In
            </Link>
            <Link to="/signup">
              <Button variant="cta" size="sm" className="shimmer">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/10 transition-colors border border-border"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => ( // Use navLinks directly for mobile
                <Link
                  key={link.label} // Use Link for internal routes and external for external
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground py-2 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/login" className="text-sm font-medium text-muted-foreground py-2 hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="cta" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section - Layered Visual Stack */}
      <section className="relative min-h-[85vh] overflow-hidden bg-hero-gradient flex items-center">
        <div className="relative container mx-auto px-4 text-center z-10 pt-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-8"
            >
              🇿🇦 Amandla e-Ubuntu · Built for South Africa
            </motion.span>
            <motion.h1
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-display text-5xl md:text-8xl text-white font-bold leading-tight mb-6"
            >
              Your AI guide to{" "}
              <span className="text-highlight">economic freedom</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Discover career pathways rooted in Ubuntu values. Join thousands of young South Africans
              building better futures with AI-powered guidance that works.
            </motion.p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="cta" size="xl">Get Started Free <ArrowRight className="h-4 w-4 ml-2" /></Button>
              <Button variant="outlineLight" size="xl">Watch Demo <Play className="h-4 w-4 ml-2 fill-white" /></Button>
            </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-b border-border bg-background py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {trustStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 px-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-accent flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story - Siyanda */}
      <section id="ubuntu-stories" className="py-20 bg-subtle-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="bg-card border border-border rounded-xl shadow-elegant p-8">
              <h2 className="font-display text-3xl font-bold mb-6">Siyanda's Journey</h2>
              <ol className="relative space-y-3.5">
                {/* vertical connector */}
                <span aria-hidden className="absolute left-[18px] top-3 bottom-3 w-px bg-border/80" />

                {[
                  { n: 1, label: "Uploaded CV",       sub: "Domestic worker, 7 years" },
                  { n: 2, label: "Explored 5 Paths",  sub: "Tech, care, retail, admin" },
                  { n: 3, label: "Chose Tech Skills", sub: "12-week digital fundamentals" },
                  { n: 4, label: "Hired in 6 weeks",  sub: "Junior IT support, Cape Town" },
                  { n: 5, label: "R4,500/month",      sub: "+180% income vs. previous" },
                ].map((s) => (
                  <li key={s.n} className="relative flex items-center gap-4 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 backdrop-blur-sm">
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm">
                      {s.n}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-foreground">{s.label}</p>
                      <p className="text-xs leading-snug text-muted-foreground">{s.sub}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <blockquote className="mt-6 border-l-2 border-secondary pl-4 italic text-foreground/90">
                "EmpowAI taught me that ubuntu is a business strategy."
                <footer className="mt-1 not-italic text-xs text-muted-foreground">
                  — Siyanda · Featured story
                </footer>
              </blockquote>
            </div>
            <div>
               <h3 className="font-display text-4xl font-bold text-primary mb-6">Built for South African Reality</h3>
               <p className="text-muted-foreground mb-8">We understand the unique challenges faced by youth in Mzansi. Our AI doesn't just scan skills; it finds paths to economic freedom.</p>
               <Button variant="cta" size="xl">Join 2,000+ Youth <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Upload, title: "Share Your Story", desc: "Upload your CV or build one with our AI coach." },
              { icon: Target, title: "Discover Paths", desc: "See real income projections across 5 career paths." },
              { icon: TrendingUp, title: "Start Earning", desc: "Get matched with learnerships and jobs in your province." }
            ].map((step, i) => (
              <div key={i} className="text-center p-8 bg-card border border-border rounded-xl shadow-elegant">
                <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
           <div className="flex flex-col items-center">
             <Brain className="h-10 w-10 mb-4" />
             <p className="text-primary-foreground/70 text-center max-w-sm mb-8 italic">"Umuntu Ngumuntu Ngabantu - Join 2,000+ empowered youth across South Africa."</p>
             <div className="flex gap-8 mb-8">
               <a href="#how-it-works" className="text-sm hover:text-secondary transition-colors">How It Works</a>
               <a href="#ubuntu-stories" className="text-sm hover:text-secondary transition-colors">Success Stories</a>
               <Link to="/privacy" className="text-sm hover:text-secondary transition-colors">Privacy</Link>
             </div>
             <p className="text-primary-foreground/40 text-xs">© 2025 EmpowAI. Built with Ubuntu. ZAR</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
