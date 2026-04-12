import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Cpu,
  Heart,
  TrendingUp,
  Star,
  Upload,
  Gauge,
  Mail,
  Menu,
  X,
  Users,
  Target,
  BarChart3,
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
  Zap,
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useLanguageRotation } from "../hooks/use-language-rotation";
import RotatingText from "../components/ui/RotatingText";
import Logo from "../components/ui/Logo";
import logo from "../assets/images/empoweraidemo.png";
import siyandaImg from "../assets/images/result.jpg";

const navLinks = ["How It Works", "Features", "Ubuntu Stories", "Demo"];

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
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          <Logo />

          {/* Desktop Navigation */}
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

          <div className="hidden md:flex items-center gap-2">
            <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
              Sign In
            </a>
            <ThemeToggle />
            <a
              href="/signup"
              className="bg-sa-gold hover:bg-sa-gold/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 hover:bg-secondary rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-muted-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </a>
              ))}
              <a href="/login" className="text-sm font-medium text-muted-foreground py-2">
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-sa-gold text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sa-gold/10 via-background to-sa-green/5 -z-10" />

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 bg-sa-gold/10 text-sa-gold text-sm font-semibold px-4 py-1.5 rounded-full border border-sa-gold/20">
              <Sparkles className="w-4 h-4" />
              <RotatingText text={t("poweredBy")} langKey={langIndex} /> 🇿🇦
            </span>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold italic leading-tight">
              Your Future, Powered by AI
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Discover career pathways rooted in Ubuntu values.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 bg-sa-gold text-primary-foreground px-6 py-3 rounded-lg text-sm font-heading font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                Start Your Journey <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 border-2 border-border text-foreground px-6 py-3 rounded-lg text-sm font-heading font-semibold hover:bg-secondary transition-colors"
              >
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-12 border-y border-border bg-background/50">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Cpu, title: "AI-powered career", sub: "guidance in 60 seconds" },
                { icon: Heart, title: "Rooted in", sub: "Ubuntu values" },
                { icon: TrendingUp, title: "Personalized pathways", sub: "to income growth" },
                { icon: Star, title: "Trusted by 1,000+ youth", sub: "Rated 4.9/5", fill: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <item.icon className={`h-5 w-5 ${item.fill ? "fill-sa-gold text-sa-gold" : "text-sa-gold"}`} />
                  </div>
                  <div>
                    <p className="text-xs font-heading font-bold text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Story Section - Clean Professional Card */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-12">
            Featured Story
          </h2>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 max-w-6xl mx-auto">
            {/* Profile Card - Matching the design */}
            <div className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-md overflow-visible">
              {/* Mahala Badge - Top Right */}
              <div className="absolute -top-5 right-4 bg-sa-green text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                CV Analyser <RotatingText text={t("mahala")} langKey={langIndex} />
              </div>

              <div className="p-6 pt-8">
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-700">
                    <img
                      src={siyandaImg}
                      alt="Siyanda Nkosi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-card-foreground">Siyanda Nkosi, 22</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Boksburg, Gauteng <span className="text-red-500">📍</span>
                    </p>
                  </div>
                </div>

                {/* Empowerment Score */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-sa-green">Empowerment Score</span>
                    <span className="font-bold text-sa-green">78/100</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sa-gold via-yellow-400 to-sa-green rounded-full"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>

                {/* Two Column Stats */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Income Potential</p>
                    <p className="font-bold text-xl text-card-foreground">
                      R8,500<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Top Path</p>
                    <p className="font-bold text-xl text-card-foreground">Tech Skills</p>
                  </div>
                </div>

                {/* Match Rate */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-secondary/30 rounded-xl p-4 mb-4 border border-gray-100 dark:border-border">
                  <div className="w-8 h-8 flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">95% Match Rate</p>
                    <p className="text-xs text-muted-foreground">Career pathways</p>
                  </div>
                </div>
              </div>

              {/* CV Analysis Time - Bottom Pill */}
              <div className="absolute -bottom-6 left-4 bg-gray-100 dark:bg-secondary text-sm text-muted-foreground rounded-full px-4 py-2 shadow-md flex items-center gap-2">
                CV analyzed in <span className="font-bold text-sa-gold">60 seconds</span> <Zap className="h-4 w-4 text-sa-gold" />
              </div>
            </div>

            {/* Quote */}
            <div className="flex items-center justify-center">
              <p className="text-2xl md:text-3xl lg:text-4xl italic text-muted-foreground leading-relaxed text-center font-medium max-w-md">
                Real youth, real futures unlocked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-sa-green text-sm font-semibold uppercase tracking-wider mb-2 block">
              <RotatingText
                text={t("thePath")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — The Path
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-3xl mx-auto border border-border rounded-xl overflow-hidden bg-card">
            {[
              { icon: Upload, num: "1", title: "Upload Your CV" },
              { icon: Gauge, num: "2", title: "Get Your Empowerment Score" },
              { icon: Mail, num: "3", title: "Explore Career Paths" },
            ].map((step, i) => (
              <div
                key={i}
                className={`text-center p-6 space-y-3 ${
                  i < 2 ? "md:border-r border-b md:border-b-0 border-border" : ""
                }`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-sa-gold/10 text-sa-gold mx-auto">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-card-foreground text-sm">
                  {step.num}. {step.title}
                </h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-sa-gold text-primary-foreground px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Start Your Journey
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sa-gold text-sm font-semibold uppercase tracking-wider mb-2 block">
              <RotatingText
                text={t("ourTools")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — Our Tools
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mt-3">
              Built by South Africans, for South Africans. AI tools that understand our unique economy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 space-y-3 border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-sa-gold/10 flex items-center justify-center text-sa-gold">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-sa-terracotta text-sm font-semibold uppercase tracking-wider mb-2 block">
              <RotatingText
                text={t("watch")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — Watch
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              See EmpowAI in Action
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-3">
              Watch how we're helping South African youth discover their economic potential
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated bg-card aspect-video flex items-center justify-center border border-border">
              <img
                src={logo}
                alt="EmpowAI Demo"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-full bg-sa-gold flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-transform shadow-elevated">
                  <Play className="h-8 w-8 text-primary-foreground ml-1" />
                </div>
                <p className="text-white font-body text-sm">Demo Coming Soon</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: "Quick Setup", sub: "Under 5 minutes" },
                { label: "95% Accurate", sub: "Career matching" },
                { label: "All 9 Provinces", sub: "Across Mzansi" },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-card rounded-xl shadow-card border border-border">
                  <p className="font-heading font-bold text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ubuntu Stories (Testimonials) */}
      <section id="ubuntu-stories" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sa-terracotta text-sm font-semibold uppercase tracking-wider mb-2 block">
              <RotatingText
                text={t("successStories")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — Ubuntu Stories
            </span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Real Success Stories from Mzansi
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-3">
              See how EmpowAI is transforming careers across all 9 provinces
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "EmpowAI helped me discover tech skills I didn't know I had. From Khayelitsha to a R12k/month developer role. Siyabonga!",
                initials: "LM",
                name: "Lerato Mokoena",
                role: "Student → Software Developer",
                location: "Cape Town, WC",
              },
              {
                quote: "The career simulation showed me entrepreneurship was my path. Now running my own spaza shop and digital marketing agency!",
                initials: "SK",
                name: "Sipho Khumalo",
                role: "Unemployed → Business Owner",
                location: "Durban, KZN",
              },
              {
                quote: "From minimum wage to a career I love. The AI guidance understood my reality as a young South African. Truly life-changing!",
                initials: "NT",
                name: "Nomsa Tshabalala",
                role: "Waitress → Marketing Pro",
                location: "Johannesburg, GP",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 space-y-4 border border-border"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-sa-gold text-sa-gold" />
                  ))}
                </div>
                <p className="text-sm text-card-foreground leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-sa-gold/20 flex items-center justify-center text-sa-gold text-xs font-heading font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-card-foreground text-sm">{t.name}</p>
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
      <section className="py-16 bg-gradient-to-r from-sa-gold/10 via-sa-terracotta/10 to-sa-red/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              <RotatingText text={t("letsBegin")} langKey={langIndex} /> — Let's Begin
            </h2>
            <p className="text-muted-foreground">
              Join over 1,000 young South Africans building better careers with AI-powered guidance. Together, we rise. 🇿🇦
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-sa-gold text-primary-foreground px-8 py-3 rounded-lg font-heading font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Get Started — It's <RotatingText text={t("mahala")} langKey={langIndex} /> <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-secondary border-t border-border">
        <div className="container mx-auto px-4 space-y-6">
          <p className="text-center text-sm md:text-base text-foreground italic">
            Join 1,000+ empowered youth across South Africa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {["Features", "Ubuntu Stories", "Demo", "Sign In", "Get Started"].map((link, i, arr) => (
              <span key={link} className="flex items-center gap-4 md:gap-6">
                <a
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-foreground underline underline-offset-2 hover:text-sa-gold transition-colors"
                >
                  {link}
                </a>
                {i < arr.length - 1 && <span className="text-border">|</span>}
              </span>
            ))}
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-sa-gold/10 flex items-center justify-center text-sa-gold hover:bg-sa-gold hover:text-primary-foreground transition-colors">
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
