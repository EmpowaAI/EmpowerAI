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
  Quote,
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useLanguageRotation } from "../hooks/use-language-rotation";
import RotatingText from "../components/ui/RotatingText";
import Logo from "../components/ui/Logo";
import Card from "../components/ui/Card";
import logo from "../assets/images/empoweraidemo.png";
import siyandaImg from "../assets/images/siyaimage.png";

const navLinks = ["How It Works", "Ubuntu Stories", "Demo"];

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
  const heroBackgroundUrl = encodeURI(
    `${import.meta.env.BASE_URL}images/Wide blue-orange gra.png`
  );
  const navLinkClassName = scrolled
    ? "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    : "text-sm font-medium text-white/90 hover:text-white transition-colors";
  const navAuxLinkClassName = scrolled
    ? "text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
    : "text-sm font-medium text-white/90 hover:text-white px-3 py-2 transition-colors";

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
            ? "bg-background/70 backdrop-blur-md border-b border-border/60"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={link === "Demo" ? "/demo" : `#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className={navLinkClassName}
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className={navAuxLinkClassName}>
              Sign In
            </a>
            <ThemeToggle />
            <a
              href="/signup"
              className="bg-secondary text-white px-6 py-2.5 rounded-full font-semibold shadow-cta hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-smooth text-sm"
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
                  href={link === "Demo" ? "/demo" : `#${link.toLowerCase().replace(/\s+/g, "-")}`}
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
                className="bg-cta-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-center shadow-cta hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-smooth shimmer"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </header>

      <section className="relative isolate pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden ai-mesh">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transform-gpu z-0"
          style={{
            backgroundImage: `url("${heroBackgroundUrl}")`,
          }}
        />
        <div className="absolute inset-0 hero-spotlight z-10" />
        <div className="absolute inset-0 bg-hero-gradient opacity-35 z-20" />
        <div className="absolute inset-0 ai-grid z-20" />
        <div className="absolute inset-0 hero-vignette z-30" />
        <div className="absolute inset-0 grain z-40" />

        <div className="container relative z-50 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-semibold"
            >
              <span className="ai-dot"></span>
              <span>
                Amandla e-Ubuntu · 🇿🇦 <RotatingText text={t("poweredBy")} langKey={langIndex} /> Ubuntu
              </span>
            </motion.span>

            {/* Tech signal strip */}
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-3 rounded-full bg-white/60" />
              ))}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white font-heading"
            >
              Your Digital{' '}
              <span className="text-highlight">Economic Twin</span>
              <br className="hidden sm:block" />
              Awaits
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg max-w-3xl mx-auto text-white/95 font-body leading-relaxed"
            >
              Discover career pathways rooted in Ubuntu values. Join thousands of young South Africans building better futures with AI-powered guidance that works.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 pt-6"
            >
              <a
                href="/signup"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-sm font-display font-semibold shadow-cta hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-smooth"
              >
                Start Your Journey <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/demo"
                className="inline-flex items-center gap-2 border-2 border-white/90 bg-white/0 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl text-sm font-display font-semibold transition-smooth"
              >
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </motion.div>
          </div>
        </div>

        {/* Tech Signals Strip */}
        <div className="absolute z-50 bottom-0 left-0 right-0 border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-8 text-white/90 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-secondary" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-secondary" />
                <span>60-Second Results</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
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
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              Indlela — The Path
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-2">
              Siyanda's Journey: from R0 to R4,500/month
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              He didn't get lucky — he explored, compared, and chose. Here's exactly how it went.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* LEFT - Profile Card */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-primary border border-primary/20 text-xs sm:text-sm font-semibold w-fit">
                    🇿🇦 Boksburg, GP
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-secondary shadow-md">
                      <img
                        src={siyandaImg}
                        alt="Siyanda Nkosi"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-card-foreground">Siyanda Nkosi, 22</h3>
                      <p className="text-sm text-muted-foreground">First gig in 6 weeks</p>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/10">
                    <div className="text-3xl font-bold text-primary">78/100</div>
                    <div className="text-sm text-muted-foreground">Empowerment Score</div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                    <div>
                      <div className="text-sm text-muted-foreground">Before</div>
                      <div className="text-lg font-semibold text-muted-foreground">R0</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-secondary" />
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">After 8 months</div>
                      <div className="text-2xl font-bold text-primary">R4,500</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "5", label: "Paths" },
                      { value: "6", label: "Gigs" },
                      { value: "95%", label: "Match" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-3 bg-secondary/5 rounded-lg">
                        <div className="text-xl font-bold text-secondary">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT - Journey List */}
            <div className="flex flex-col gap-4">
              <Card className="rounded-2xl shadow-card border border-border">
                <div className="p-6 sm:p-8">
                  <h3 className="font-display font-bold text-xl mb-5 flex items-center gap-2 font-heading">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    The 5-step journey
                  </h3>
                  <ol className="space-y-3">
                    {journeySteps.map((step, idx) => (
                      <li key={step.label} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-sm font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-card-foreground">
                          {step.label} → {step.detail}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Card>

              <div className="p-4 border-l-4 border-secondary bg-secondary/5 rounded-r-lg">
                <p className="italic text-primary font-medium">
                  "EmpowAI taught me that ubuntu is a business strategy."
                </p>
                <p className="text-xs text-muted-foreground mt-2">— Siyanda</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ubuntu Stories Section */}
      <section id="ubuntu-stories" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2 inline-block">
              <RotatingText
                text={t("successStories")}
                langKey={langIndex}
                languageLabel={getLanguageDisplay(currentLanguage)}
              /> — <span className="text-secondary">Ubuntu</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
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
              >
                <Card className="bg-primary text-primary-foreground overflow-hidden relative rounded-2xl shadow-card border border-border p-6 h-full">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-secondary/20 to-transparent" />

                  <Quote className="h-8 w-8 text-secondary/40" />
                  <p className="italic mt-4 leading-relaxed">"{t.quote}"</p>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center font-display font-bold text-sm">
                      {t.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{t.name}</p>
                      <p className="text-sm opacity-90">🇿🇦 {t.location}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <p className="text-sm opacity-90">{t.role}</p>
                    <p className="text-sm font-semibold text-secondary">{t.earnings}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              <RotatingText text={t("letsBegin")} langKey={langIndex} /> — Let's Begin
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Join over 2,000 young South Africans building better careers with AI-powered guidance. Together, we rise. 🇿🇦
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-cta-gradient text-white px-8 py-3 rounded-xl font-display font-semibold shadow-cta hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-smooth shimmer"
              >
                Get Started — It's <RotatingText text={t("mahala")} langKey={langIndex} />{" "}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/demo"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary/25 text-primary px-8 py-3 rounded-xl font-heading font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Play className="h-4 w-4" /> Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary border-t border-border text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <p className="text-center text-sm md:text-base text-primary-foreground/90 italic">
            Join 2,000+ empowered youth across South Africa.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {navLinks.map((link, i) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-primary-foreground/90 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
            <span className="text-primary-foreground/25">|</span>
            <a
              href="/login"
              className="text-sm text-primary-foreground/90 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <span className="text-primary-foreground/25">|</span>
            <a
              href="/signup"
              className="text-sm text-primary-foreground/90 hover:text-white transition-colors"
            >
              Get Started
            </a>
          </div>

          <div className="flex justify-center gap-4">
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/15 transition-all hover:scale-110">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/15 transition-all hover:scale-110">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/15 transition-all hover:scale-110">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/15 transition-all hover:scale-110">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          <p className="text-center text-xs text-primary-foreground/70">
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
