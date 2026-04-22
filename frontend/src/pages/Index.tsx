import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  MapPin,
  TrendingUp,
  Target,
  Upload,
  Quote,
  Brain,
  Menu,
  X,
} from "lucide-react";
import Button from "../components/ui/Button";

// Hero background image - replace with actual image
const heroBg = "/images/hero-bg.jpg";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Ubuntu Stories", href: "#ubuntu-stories" },
  { label: "Demo", href: "#demo" },
];

const journeySteps = [
  {
    number: "01",
    titleZulu: "Indlela",
    titleEn: "Onboarding & skills assessment",
    description: "Share your story, upload your CV, and let AI discover your unique strengths"
  },
  {
    number: "02", 
    titleZulu: "Izinsiza Zethu",
    titleEn: "Matched to local opportunities",
    description: "AI finds perfect opportunities in your province - from tech to trades"
  },
  {
    number: "03",
    titleZulu: "Mahala", 
    titleEn: "Free AI-powered training modules",
    description: "Get personalized training at no cost - Ubuntu values in action"
  },
  {
    number: "04",
    titleZulu: "Ukukhula",
    titleEn: "First income milestone", 
    description: "Start earning and growing - your journey to economic freedom begins"
  },
  {
    number: "05",
    titleZulu: "Siyaqala!",
    titleEn: "Sustainable monthly earnings",
    description: "Build lasting success - from R0 to R4,500+ per month"
  }
];

const trustStats = [
  { icon: "ZAR", value: "2.1M", label: "earned collectively" },
  { icon: "9", value: "9", label: "Provinces reached" },
  { icon: "12.4K", value: "12,400+", label: "Ubuntu members" },
  { icon: "94%", value: "94%", label: "match accuracy" }
];

const testimonials = [
  {
    name: "Siyanda Khumalo",
    location: "Khayelitsha, WC",
    role: "Junior Developer",
    content: "EmpowAI saw potential I didn't know I had. From unemployment to R4,500/month in just 12 weeks - Ubuntu in action.",
    region: "WC"
  },
  {
    name: "Thandi Nkosi", 
    location: "Umlazi, KZN",
    role: "Digital Marketing",
    content: "The AI matched me with opportunities I never knew existed. Now I'm earning and helping my family.",
    region: "KZN"
  },
  {
    name: "Bongani Mokoena",
    location: "Soweto, GP", 
    role: "Data Analyst",
    content: "Free training, real opportunities, actual income. This is what economic freedom looks like for young South Africans.",
    region: "GP"
  }
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
          scrolled ? "bg-background/85 backdrop-blur-md border-b border-border/60" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">EmpowAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <Button variant="cta" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-secondary/10 transition-colors border border-border"
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
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-muted-foreground py-2 hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
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
      <section className="relative min-h-[92vh] overflow-hidden">
        {/* Layer 1: Hero Image */}
        <img 
          src={heroBg} 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="" 
          aria-hidden 
        />
        
        {/* Layer 2: Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_60%_8%/0.55)] via-[hsl(220_60%_10%/0.45)] to-[hsl(220_60%_8%/0.7)]" />
        
        {/* Layer 3: Animated AI Blobs */}
        <div className="absolute inset-0 ai-mesh" />
        
        {/* Layer 4: Tech Grid */}
        <div className="absolute inset-0 ai-grid" />
        
        {/* Layer 5: Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm"
            >
              <span className="ai-dot" />
              Powered by Ubuntu
              <span className="hidden sm:inline">Built for South Africa</span>
              <span className="text-xl">ZAR</span>
            </motion.span>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl text-white leading-tight"
            >
              Your AI guide to{" "}
              <span className="text-gradient-ai">economic freedom</span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed"
            >
              Discover career pathways rooted in Ubuntu values. Join thousands of young South Africans 
              building better futures with AI-powered guidance that works.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup">
                <Button variant="cta" size="xl" className="shimmer">
                  Start Your Journey <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="#demo">
                <Button variant="outlineLight" size="xl">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Tech Signal Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center gap-8 text-white/80 text-sm font-medium pt-8"
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>60-Second Results</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>All 9 Provinces</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story - Centerpiece */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              Featured Story
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
              Siyanda's Journey: from R0 to R4,500/month
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              He didn't get lucky - he explored, compared, and chose. Here's exactly how it went.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left Column - Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                    SK
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Siyanda Khumalo</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Khayelitsha, WC</span>
                    </div>
                  </div>
                </div>

                {/* Empowerment Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Empowerment Score</span>
                    <span className="text-sm font-bold text-secondary">92%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  </div>
                </div>

                {/* Income Transformation */}
                <div className="text-center py-6 border-t border-border">
                  <div className="text-3xl font-display font-bold text-gradient-ai mb-2">
                    R0 <span className="text-white/60">to</span> R4,500/month
                  </div>
                  <div className="text-sm text-muted-foreground">12 weeks to first income</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - 5-Step Journey */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                {journeySteps.map((step, i) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    {/* Number Bubble */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                        {step.number}
                      </div>
                      {i < journeySteps.length - 1 && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <h4 className="font-display text-lg font-bold text-primary mb-1">
                        {step.titleZulu}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.titleEn}
                      </p>
                      <p className="text-sm text-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
              Three Steps to Economic Freedom
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Simple, powerful, and designed for young South Africans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Upload,
                title: "Upload",
                description: "Share your skills & story",
                details: "Upload your CV and tell us about your dreams. Our AI understands your unique journey."
              },
              {
                icon: Target,
                title: "Match", 
                description: "AI finds opportunities in your region",
                details: "From tech to trades, government to private sector - we match you with real opportunities."
              },
              {
                icon: TrendingUp,
                title: "Earn",
                description: "Get paid, grow, give back",
                details: "Start earning, build skills, and contribute to your community. Ubuntu in action."
              }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-2xl shadow-card p-8 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {step.description}
                  </p>
                  <p className="text-sm text-foreground">
                    {step.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              Ubuntu Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
              Real Success from Mzansi
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Hear from young South Africans transforming their lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="bg-card rounded-2xl shadow-card p-8 border border-border h-full">
                  <Quote className="h-8 w-8 text-secondary mb-4" />
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} · {testimonial.location}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
                      {testimonial.region}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Band */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary ubuntu-pattern">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of young South Africans building better futures with AI-powered guidance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="cta" size="xl" className="shimmer">
                  Start Free Today <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="#demo">
                <Button variant="outlineLight" size="xl">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-xl font-bold text-foreground">EmpowAI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI-powered career guidance rooted in Ubuntu values. Built for young South Africans.
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#ubuntu-stories" className="hover:text-foreground transition-colors">Success Stories</a></li>
                <li><a href="#demo" className="hover:text-foreground transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 EmpowAI. Built with Ubuntu for South Africa. ZAR</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
