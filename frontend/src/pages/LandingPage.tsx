import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Cpu,
  HeartHandshake,
  TrendingUp,
  Star,
  Upload,
  Gauge,
  Mail,
  Menu,
  X,
  Sparkles,
  Brain,
  FileText,
  Briefcase,
  MessageSquare,
  Map,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  FileText as FileIcon,
  Compass,
  Target,
  Rocket,
  CheckCircle2,
  Zap,
  MapPin,
  Trophy,
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useLanguageRotation } from "../hooks/use-language-rotation";
import RotatingText from "../components/ui/RotatingText";
import Logo from "../components/ui/Logo";
import logo from "../assets/images/empoweraidemo.png";
import siyandaImg from "../assets/images/siyaimage.png";

const navLinks = ["How It Works", "Features", "Ubuntu Stories", "Demo"];

const journeySteps = [
  { icon: FileIcon, label: "Uploaded CV", detail: "Analyzed in 60 seconds" },
  { icon: Compass, label: "Explored 5 Paths", detail: "Tech, Trades, SMME, Gov, Creative" },
  { icon: Target, label: "Chose Tech Skills", detail: "95% match — best fit" },
  { icon: Rocket, label: "Hired in 6 weeks", detail: "Junior dev, remote-friendly" },
  { icon: TrendingUp, label: "R4,500/month", detail: "Up from R0 — and growing" },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, currentLanguage, langIndex } = useLanguageRotation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case "Sesotho sa Leboa":
        return "Sesotho sa Leboa";
      default:
        return lang;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border/60"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
              Sign In
            </a>
            <ThemeToggle />
            <a
              href="/signup"
              className="bg-sa-gold hover:bg-sa-gold/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
            >
              Get Started
            </a>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-muted-foreground py-2 hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </a>
              ))}
              <a href="/login" className="text-sm font-medium text-muted-foreground py-2 hover:text-foreground transition-colors">
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-sa-gold text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </header>

      <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden ai-mesh">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(220_60%_8%/0.55),transparent_30%,transparent_65%,hsl(220_60%_8%/0.45))] -z-10" />
        <div className="absolute inset-0 ai-grid -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md text-white text-sm font-semibold px-4 py-2"
            >
              <Sparkles className="w-4 h-4" />
              Amandla e-Ubuntu <RotatingText text={t("poweredBy")} langKey={langIndex} /> <span className="ai-dot"></span> 2025
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              Your Digital{' '}
              <span className="text-gradient-ai">Economic Twin</span>
              <br className="hidden sm:block" />
              Awaits
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg max-w-2xl mx-auto text-white/90 font-body"
            >
              Discover career pathways rooted in Ubuntu values. Join thousands of young South Africans building better futures with AI-powered guidance.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <a
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-6 py-3 rounded-lg text-sm font-display font-semibold shadow-cta hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-smooth shimmer"
              >
                Start Your Journey <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 border-2 border-white/90 bg-white/0 text-white hover:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg text-sm font-display font-semibold transition-smooth"
              >
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </motion.div>
          </div>
        </div>

        {/* Tech Signals Strip */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>60-Second Results</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>All 9 Provinces</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Rocket, 
                title: "AI-Powered Analysis", 
                desc: "60-second career assessment",
                color: "text-primary"
              },
              { 
                icon: HeartHandshake, 
                title: "Ubuntu Values", 
                desc: "Rooted in African philosophy",
                color: "text-primary"
              },
              { 
                icon: Briefcase, 
                title: "Real Opportunities", 
                desc: "Across all 9 provinces",
                color: "text-primary" 
              },
              { 
                icon: Star, 
                title: "Proven Success", 
                desc: "2,000+ youth transformed",
                color: "text-primary"
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story Section - FIXED BADGE POSITIONING */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sa-gold text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              Featured Story
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Siyanda's Journey: from R0 to R4,500/month
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              He didn't get lucky — he explored, compared, and chose. Here's exactly how it went.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Story Card Container - Added bottom padding for badge */}
            <div className="relative w-full max-w-md mx-auto lg:mx-0 pb-8">
              {/* Top Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:-translate-x-0 z-20 bg-gradient-to-r from-sa-green to-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
                <Zap className="w-3.5 h-3.5" />
                CV Analyser · <RotatingText text={t("mahala")} langKey={langIndex} />
              </div>

              {/* Main Card */}
              <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-sa-gold shadow-md">
                      <img
                        src={siyandaImg}
                        alt="Siyanda Nkosi"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-card-foreground">Siyanda Nkosi, 22</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> Boksburg, Gauteng
                      </p>
                    </div>
                  </div>

                  {/* Empowerment Score */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-sa-green">Empowerment Score</span>
                      <span className="font-bold text-sa-green">78/100</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-secondary/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sa-gold via-yellow-400 to-sa-green rounded-full"
                        style={{ width: "78%" }}
                      />
                    </div>
                  </div>

                  {/* Income Transformation */}
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 mb-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Income Transformation
                    </p>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Before</p>
                        <p className="font-heading font-bold text-lg line-through opacity-60">R0</p>
                      </div>
                      <span className="text-sa-gold text-xl font-bold">→</span>
                      <div>
                        <p className="text-xs text-muted-foreground">After</p>
                        <p className="font-heading font-bold text-2xl text-sa-green">
                          R4,500<span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="rounded-xl bg-secondary/50 p-3 text-center">
                      <p className="font-heading font-bold text-xl text-card-foreground">5</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">Paths Explored</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3 text-center">
                      <p className="font-heading font-bold text-xl text-card-foreground">6 wks</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">To First Gig</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3 text-center">
                      <p className="font-heading font-bold text-xl text-card-foreground">95%</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">Match Rate</p>
                    </div>
                  </div>

                  {/* Top Path */}
                  <div className="flex items-center gap-3 rounded-xl bg-sa-gold/10 border border-sa-gold/20 p-3">
                    <Trophy className="w-5 h-5 text-sa-gold shrink-0" />
                    <div>
                      <p className="font-semibold text-card-foreground text-sm">Top Path: Tech Skills</p>
                      <p className="text-xs text-muted-foreground">Chosen after exploring 5 careers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Badge - Now positioned relative to the container with pb-8 */}
              <div className="absolute  left-1/2  -translate-x-1/2 sm:left-6 sm:-translate-x-0 z-20 bg-background border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2 whitespace-nowrap">
                <Zap className="h-3.5 w-3.5 text-sa-gold" />
                <span className="text-xs sm:text-sm">CV analyzed in <span className="font-bold text-sa-gold">60 seconds</span></span>
              </div>
            </div>

            {/* 5-Step Journey Timeline */}
            <div className="flex-1">
              <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-lg h-full">
                <h3 className="font-heading font-bold text-xl mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sa-gold" />
                  The 5-step journey
                </h3>
                
                <div className="relative">
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-sa-gold via-sa-terracotta to-sa-green rounded-full" />
                  
                  <div className="space-y-6 relative">
                    {journeySteps.map((step, idx) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative flex items-start gap-4 pl-0"
                      >
                        <div className="relative z-10 w-10 h-10 rounded-full bg-card border-2 border-sa-gold shadow-md flex items-center justify-center shrink-0">
                          <step.icon className="w-4 h-4 text-sa-gold" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-heading font-bold text-base text-foreground">
                            {idx + 1}. {step.label}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">{step.detail}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <blockquote className="mt-8 pt-6 border-t border-border">
                  <p className="font-heading italic text-lg text-foreground leading-relaxed">
                    "I thought I had to choose blind. EmpowAI laid out 5 paths — I picked the one that fit <em>me</em>."
                  </p>
                  <footer className="mt-3 text-sm text-muted-foreground">
                    — Siyanda, 6 weeks after first login
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sa-green text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              <RotatingText
                text={t("thePath")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — The Path
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              How It Works
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Three simple steps to discover your career potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Upload, num: "01", title: "Upload Your CV", desc: "Drop your CV — or build one with us in minutes." },
              { icon: Gauge, num: "02", title: "Get Your Score", desc: "AI reveals your Empowerment Score and gaps." },
              { icon: Mail, num: "03", title: "Explore Career Paths", desc: "Compare 5+ paths with real income projections." },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
              >
                <span className="absolute top-4 right-4 font-heading font-bold text-4xl text-orange-300 dark:text-white">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-xl bg-sa-gold/10 flex items-center justify-center text-sa-gold mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-card-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-sa-gold text-primary-foreground px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Journey <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sa-gold text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              <RotatingText
                text={t("ourTools")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — Our Tools
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Built by South Africans, for South Africans. AI tools that understand our unique economy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Brain, title: "Digital Economic Twin", desc: "AI-powered simulation of your economic future, rooted in South African market realities" },
              { icon: TrendingUp, title: "Path Simulation", desc: "Visualize income projections across career paths — from SMMEs to corporate" },
              { icon: FileText, title: "CV Analysis", desc: "Get instant AI feedback tailored for SA employers and the B-BBEE landscape" },
              { icon: Briefcase, title: "Opportunity Matching", desc: "Find jobs, learnerships, and YES4Youth programmes matched to your profile" },
              { icon: MessageSquare, title: "Interview Coach", desc: "Practice interviews with AI — from panel discussions to one-on-ones" },
              { icon: Map, title: "Career Roadmap", desc: "Step-by-step guidance from matric to your dream career, wherever you are in SA" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 border border-border group"
              >
                <div className="w-12 h-12 rounded-xl bg-sa-gold/10 flex items-center justify-center text-sa-gold mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ubuntu Stories Section */}
      <section id="ubuntu-stories" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sa-terracotta text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              <RotatingText
                text={t("successStories")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — Ubuntu Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Real Success Stories from Mzansi
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              See how EmpowAI is transforming careers across all 9 provinces
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "From Khayelitsha to a junior dev role. EmpowAI showed me tech skills I didn't know I had. Siyabonga!",
                initials: "LM",
                name: "Lerato Mokoena",
                role: "Student → Software Developer",
                location: "Cape Town, WC",
                earnings: "R12,000/mo",
              },
              {
                quote: "The simulation showed me entrepreneurship was my path. Now I run my own spaza shop AND a marketing agency!",
                initials: "SK",
                name: "Sipho Khumalo",
                role: "Unemployed → Business Owner",
                location: "Durban, KZN",
                earnings: "R18,500/mo",
              },
              {
                quote: "From minimum wage to a career I love. The AI actually understood my reality as a young South African.",
                initials: "NT",
                name: "Nomsa Tshabalala",
                role: "Waitress → Marketing Pro",
                location: "Johannesburg, GP",
                earnings: "R15,000/mo",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sa-gold to-sa-terracotta flex items-center justify-center text-white font-heading font-bold text-sm shrink-0">
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-sa-gold text-sa-gold" />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-card-foreground leading-relaxed mb-4">
                  "{t.quote}"
                </p>

                <div className="mb-4 p-3 rounded-lg bg-sa-green/10 border border-sa-green/20">
                  <p className="text-xs text-muted-foreground mb-1">💰 Current Earnings</p>
                  <p className="font-bold text-lg text-sa-green">{t.earnings}</p>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sa-terracotta text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              <RotatingText
                text={t("watch")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — Watch
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              See EmpowAI in Action
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Watch how we're helping South African youth discover their economic potential
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated bg-card aspect-video flex items-center justify-center border border-border group cursor-pointer">
              <img
                src={logo}
                alt="EmpowAI Demo"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-full bg-sa-gold flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-transform shadow-elevated">
                  <Play className="h-8 w-8 text-primary-foreground ml-1" />
                </div>
                <p className="text-white font-body text-sm font-medium">Demo Coming Soon</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { label: "Quick Setup", sub: "Under 5 minutes" },
                { label: "95% Accurate", sub: "Career matching" },
                { label: "All 9 Provinces", sub: "Across Mzansi" },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-card rounded-xl shadow-card border border-border hover:shadow-elevated transition-all">
                  <p className="font-heading font-bold text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sa-gold/10 via-sa-terracotta/10 to-sa-red/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              <RotatingText text={t("letsBegin")} langKey={langIndex} /> — Let's Begin
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Join over 2,000 young South Africans building better careers with AI-powered guidance. Together, we rise. 🇿🇦
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-sa-gold text-primary-foreground px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started — It's <RotatingText text={t("mahala")} langKey={langIndex} /> <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 border-2 border-border text-foreground px-8 py-3 rounded-lg font-heading font-semibold hover:bg-secondary transition-all"
              >
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <p className="text-center text-sm md:text-base text-foreground italic">
            Join 2,000+ empowered youth across South Africa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {["Features", "Ubuntu Stories", "Demo", "Sign In", "Get Started"].map((link, i, arr) => (
              <span key={link} className="flex items-center gap-4 md:gap-6">
                <a
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-foreground hover:text-sa-gold transition-colors"
                >
                  {link}
                </a>
                {i < arr.length - 1 && <span className="text-border">|</span>}
              </span>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <a href="#" className="w-9 h-9 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-all hover:scale-110">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-all hover:scale-110">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-all hover:scale-110">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-all hover:scale-110">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © 2026 EmpowAI. Made in Mzansi 🇿🇦 —{" "}
            <RotatingText
              text={`"${t("ubuntuProverb")}"`}
              langKey={langIndex}
              languageLabel={getLanguageDisplay(currentLanguage)}
            />
          </p>
        </div>
      </footer>
    </div>
  );
}