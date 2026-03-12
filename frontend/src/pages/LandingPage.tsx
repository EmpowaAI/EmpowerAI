"use client";

import { useState, useEffect } from "react";
import { motion} from "framer-motion"; // Added AnimatePresence
import {
  ArrowRight,
  Play,
  Star,
  Users,
  Sparkles,
  X,
  Menu,
  Brain,
  TrendingUp,
  FileText,
  Briefcase,
  MessageSquare,
  Map,
  Heart,
  Target,
  BarChart3,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useLanguageRotation } from "../hooks/use-language-rotation"; // Fixed path
import RotatingText from "../components/RotatingText"; // Fixed path
// Remove the next/image import

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Ubuntu Stories", href: "#success" },
  { label: "Demo", href: "#demo" },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, currentLanguage, langIndex } = useLanguageRotation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to format language names
  const getLanguageDisplay = (lang: string) => {
    switch(lang) {
      case "Sesotho sa Leboa": return "Sesotho sa Leboa";
      default: return lang;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-sa-gold/5 to-sa-green/5" />
        <div className="absolute top-0 -left-48 w-96 h-96 bg-gradient-to-br from-sa-gold/20 to-sa-terracotta/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 -right-48 w-96 h-96 bg-gradient-to-br from-sa-green/15 to-sa-gold/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-gradient-to-br from-sa-terracotta/15 to-sa-red/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border"
          : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          {/* Logo - Updated with regular img tag */}
          <a href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sa-gold via-sa-green to-sa-blue flex items-center justify-center shadow-md overflow-hidden">
              {/* Replace with your logo image using regular img tag */}
              <img 
                src="/images/empowerLogo.jpg" // Update this path to your logo location
                alt="EmpowaAI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display">{"Empowa"}<span className="text-sa-gold">AI</span></span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </a>
            <ThemeToggle />
            <a
              href="/signup"
              className="bg-sa-gold hover:bg-sa-gold/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl text-sm"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
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
                  className="text-sm font-medium text-muted-foreground py-2 hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/login"
                className="text-sm font-medium text-muted-foreground py-2 hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-sa-gold hover:bg-sa-gold/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-center transition-colors mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pt-36 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 sa-pattern -z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-sa-gold/10 via-background to-sa-green/5 -z-10" />

        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-2 bg-sa-gold/10 text-sa-gold text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 border border-sa-gold/20">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <RotatingText text={t("poweredBy")} langKey={langIndex} /> {"\u{1F1FF}\u{1F1E6}"}
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight mb-4 sm:mb-6 font-display">
                Your Digital{" "}
                <span className="bg-gradient-to-r from-sa-gold via-sa-terracotta to-sa-red bg-clip-text text-transparent">
                  Economic Twin
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-4">
                <RotatingText text={`"${t("ubuntuProverb")}"`} langKey={langIndex} as="em" languageLabel={getLanguageDisplay(currentLanguage)} />
                {" — A person is a person through other people."}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8">
                {"AI-powered career pathways rooted in South African values. From Limpopo to the Western Cape, we're building futures together."}
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-8 justify-center lg:justify-start">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-sa-gold hover:bg-sa-gold/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {"Start Your Journey"} <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 border-2 border-border hover:border-sa-gold text-foreground hover:text-sa-gold px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105"
                >
                  <Play className="w-4 h-4" /> Watch Demo
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["\u{1F1FF}\u{1F1E6}", "\u{270A}\u{1F3FE}", "\u{1F30D}", "\u{1F49B}"].map((emoji, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-sa-gold/20 to-sa-green/20 border-2 border-background flex items-center justify-center text-sm"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <span className="font-medium">{"1,000+ youth empowered"}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-sa-gold text-sa-gold" />
                  ))}
                  <span className="font-medium ml-1">4.9/5</span>
                </div>
              </div>
            </motion.div>

            {/* Right – Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-4 right-0 bg-sa-green text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-10 animate-bounce-slow">
                <RotatingText text={t("mahala")} langKey={langIndex} /> {" Forever \u{1F193}"}
              </div>

              <div className="bg-card rounded-2xl shadow-xl border border-border p-5 sm:p-6 max-w-md w-full mx-auto lg:ml-auto">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sa-gold/30 to-sa-green/30 flex items-center justify-center text-xl">
                    {"\u{270A}\u{1F3FE}"}
                  </div>
                  <div>
                    <p className="font-bold text-card-foreground">{"Siyanda Nkosi, 22"}</p>
                    <p className="text-sm text-muted-foreground">{"Boksburg, Gauteng \u{1F4CD}"}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Empowerment Score</span>
                    <span className="font-bold text-sa-gold">78/100</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-sa-gold to-sa-green rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-secondary/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">Income Potential</p>
                    <p className="font-bold text-lg text-card-foreground">{"R8,500"}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">Top Path</p>
                    <p className="font-bold text-lg text-card-foreground">Tech Skills</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-accent rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-sa-green/10 flex items-center justify-center text-lg">
                    {"\u{1F3C6}"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-card-foreground">{"95% Match Rate"}</p>
                    <p className="text-xs text-muted-foreground">Career pathways</p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 left-4 lg:left-0 bg-card border border-border rounded-xl shadow-lg px-4 py-2 text-sm"
              >
                <span className="text-muted-foreground">{"CV analyzed in "}</span>
                <span className="font-bold text-sa-gold">{"60 seconds \u{26A1}"}</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-gradient-to-r from-sa-gold/5 via-background to-sa-green/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "63%", label: "Youth Unemployment", sub: "We're changing this", color: "text-sa-red" },
              { icon: Target, value: "1,000+", label: "Youth Empowered", sub: "across all 9 provinces", color: "text-sa-gold" },
              { icon: BarChart3, value: "10K+", label: "Career Paths", sub: "analyzed by AI", color: "text-sa-green" },
              { icon: Heart, value: "ubuntu", label: "Community First", sub: "together we rise", color: "text-sa-terracotta" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <p className="text-3xl md:text-4xl font-extrabold mb-1 font-display text-foreground">
                  {s.value === "ubuntu" ? <RotatingText text={t("ubuntu")} langKey={langIndex} /> : s.value}
                </p>
                <p className="font-semibold text-sm text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 sa-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sa-gold text-sm font-semibold uppercase tracking-wider mb-3 block">
              <RotatingText text={t("ourTools")} langKey={langIndex} languageLabel={getLanguageDisplay(currentLanguage)} />{" \u2014 Our Tools"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-display text-foreground">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Built by South Africans, for South Africans. AI tools that understand our unique economy.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Digital Economic Twin", desc: "AI-powered simulation of your economic future, rooted in South African market realities", color: "from-sa-gold/20 to-sa-gold/5" },
              { icon: TrendingUp, title: "Path Simulation", desc: "Visualize income projections across career paths \u2014 from SMMEs to corporate", color: "from-sa-green/20 to-sa-green/5" },
              { icon: FileText, title: "CV Analysis", desc: "Get instant AI feedback tailored for SA employers and the B-BBEE landscape", color: "from-sa-blue/20 to-sa-blue/5" },
              { icon: Briefcase, title: "Opportunity Matching", desc: "Find jobs, learnerships, and YES4Youth programmes matched to your profile", color: "from-sa-terracotta/20 to-sa-terracotta/5" },
              { icon: MessageSquare, title: "Interview Coach", desc: "Practice interviews with AI \u2014 from panel discussions to one-on-ones", color: "from-sa-red/20 to-sa-red/5" },
              { icon: Map, title: "Career Roadmap", desc: "Step-by-step guidance from matric to your dream career, wherever you are in SA", color: "from-sa-gold/20 to-sa-green/5" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-sa-gold/30 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sa-green text-sm font-semibold uppercase tracking-wider mb-3 block">
              <RotatingText text={t("thePath")} langKey={langIndex} languageLabel={getLanguageDisplay(currentLanguage)} />{" \u2014 The Path"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-display text-foreground">Get Started in 3 Simple Steps</h2>
            <p className="text-muted-foreground">
              {"Your journey to economic empowerment begins here \u2014 "}
              <RotatingText text={t("letsBegin")} langKey={langIndex} as="em" />
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: FileText, num: "1", title: "Upload Your CV", desc: "Our AI analyzes your skills, matric results, and qualifications in seconds" },
              { icon: Brain, num: "2", title: "Build Your Twin", desc: "Create your digital economic profile with goals tailored to SA opportunities" },
              { icon: TrendingUp, num: "3", title: "Explore Your Future", desc: "Discover career paths, income projections, and opportunities across Mzansi" },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-sa-blue text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <s.icon className="w-7 h-7" />
                </div>
                <span className="absolute top-0 right-1/2 translate-x-12 -translate-y-2 bg-gradient-to-br from-sa-green to-sa-terracotta text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {s.num}
                </span>
                <h3 className="font-bold text-lg mb-2 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 md:py-28 sa-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sa-terracotta text-sm font-semibold uppercase tracking-wider mb-3 block">
              <RotatingText text={t("watch")} langKey={langIndex} languageLabel={getLanguageDisplay(currentLanguage)} />{" \u2014 Watch"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-display text-foreground">{"See EmpowaAI in Action"}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {"Watch how we're helping South African youth discover their economic potential"}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group cursor-pointer"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border hover:scale-[1.02] transition-transform duration-300">
                <img
                  src="images/empoweraidemo.png"
                  alt="EmpowaAI Demo Preview"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-sa-gold flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                    <Play className="h-6 w-6 text-primary-foreground ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-card-foreground">
                  Demo Coming Soon
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats row under demo */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-10">
            {[
              { icon: "clock", label: "Quick Setup", sub: "Under 5 minutes" },
              { icon: "target", label: "95% Accurate", sub: "Career matching" },
              { icon: "users", label: "All 9 Provinces", sub: "Across Mzansi" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-secondary flex items-center justify-center">
                  {item.icon === "clock" && (
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  )}
                  {item.icon === "target" && <Target className="w-4 h-4 text-sa-gold" />}
                  {item.icon === "users" && <Users className="w-4 h-4 text-muted-foreground" />}
                </div>
                <p className="font-bold text-sm text-card-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="success" className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sa-terracotta text-sm font-semibold uppercase tracking-wider mb-3 block">
              <RotatingText text={t("successStories")} langKey={langIndex} languageLabel={getLanguageDisplay(currentLanguage)} />{" \u2014 Ubuntu Stories"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-display text-foreground">Real Success Stories from Mzansi</h2>
            <p className="text-muted-foreground">{"See how EmpowaAI is transforming careers across all 9 provinces"}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "EmpowaAI helped me discover tech skills I didn't know I had. From Khayelitsha to a R12k/month developer role. Siyabonga!",
                name: "Lerato Mokoena",
                initials: "LM",
                role: "Student \u2192 Software Developer",
                location: "Cape Town, WC",
              },
              {
                quote: "The career simulation showed me entrepreneurship was my path. Now running my own spaza shop and digital marketing agency!",
                name: "Sipho Khumalo",
                initials: "SK",
                role: "Unemployed \u2192 Business Owner",
                location: "Durban, KZN",
              },
              {
                quote: "From minimum wage to a career I love. The AI guidance understood my reality as a young South African. Truly life-changing!",
                name: "Nomsa Tshabalala",
                initials: "NT",
                role: "Waitress \u2192 Marketing Pro",
                location: "Johannesburg, GP",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-sa-gold/30 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-sa-gold text-sa-gold" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6 italic text-muted-foreground">{`"${t.quote}"`}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sa-gold/20 to-sa-green/20 flex items-center justify-center font-bold text-xs text-foreground">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                    <p className="text-xs text-sa-gold">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sa-gold via-sa-terracotta to-sa-red" />
        <div className="absolute inset-0 sa-pattern opacity-20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
            <RotatingText text={t("letsBegin")} langKey={langIndex} className="text-white/70" />{" \u2014 Let's Begin"}
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 font-display">
            Ready to Transform Your Future?
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg">
            {"Join over 1,000 young South Africans building better careers with AI-powered guidance. Together, we rise. \u{1F1FF}\u{1F1E6}"}
          </p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-sa-terracotta px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-2xl hover:scale-105"
          >
            {"Get Started \u2014 It's "}<RotatingText text={t("mahala")} langKey={langIndex} /> <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 sm:py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 items-start">
            <div className="text-center md:text-left">
              <a href="/" className="flex items-center justify-center md:justify-start gap-2 font-bold text-lg mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sa-gold via-sa-green to-sa-blue flex items-center justify-center shadow-sm overflow-hidden">
                  {/* Replace with your logo image in footer too */}
                  <img 
                    src="/images/empowerLogo.jpg" // Update this path to your logo location
                    alt="EmpowaAI Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-display text-foreground">{"Empowa"}<span className="text-sa-gold">AI</span></span>
              </a>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto md:mx-0">
                {"AI-powered career guidance for South African youth. Built with Ubuntu values \u2014 because together, we rise."}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
                <a href="#success" className="hover:text-foreground transition-colors">Ubuntu Stories</a>
              </div>
              <div className="flex items-center gap-2 text-2xl">
                {"\u{1F1FF}\u{1F1E6}"}
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right">
              <ThemeToggle />
              <p className="text-xs text-muted-foreground">{"\u00A9 2026 EmpowaAI. Made in Mzansi \u{1F1FF}\u{1F1E6}"}</p>
              <p className="text-xs text-muted-foreground italic">
                <RotatingText text={`"${t("ubuntuProverb")}"`} langKey={langIndex} languageLabel={getLanguageDisplay(currentLanguage)} />
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
