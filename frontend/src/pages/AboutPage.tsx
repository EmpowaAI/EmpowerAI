import { Users, Target, Heart, Award, Mail, MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[100dvh] bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Logo variant="default" size="md" linkTo="/" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary mb-4">
            <Sparkles className="h-3 w-3" />
            About Us
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4 tracking-tight">
            About EmpowaAI
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering South African Youth Through Technology
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-card-soft"
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-ai-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3">Our Mission</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                EmpowaAI exists to bridge the gap between South African youth and economic opportunity. We believe every
                young person deserves a clear path to financial independence, regardless of their background or
                circumstances. Our platform uses AI to provide personalized career guidance, real opportunities, and
                practical tools to build their future.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-card-soft"
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-ai-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3">The Challenge</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                South Africa faces a youth unemployment crisis. Young people struggle with:
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                {[
                  "Limited access to career guidance and mentorship",
                  "Difficulty finding relevant opportunities",
                  "Lack of visibility into future earning potential",
                  "CVs that do not stand out to employers",
                  "Interview anxiety and lack of preparation",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-card-soft"
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-ai-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3">How We Help</h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                {[
                  { title: "Digital Economic Twin", desc: "Create your personalized AI avatar to simulate career paths and potential income growth." },
                  { title: "Real Job Opportunities", desc: "Access verified learnerships, internships, bursaries, and entry-level jobs." },
                  { title: "AI CV Analyzer", desc: "Get instant CV feedback with practical suggestions aligned to market requirements." },
                  { title: "Interview Coach", desc: "Practice interviews and improve confidence with guided feedback." },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-card-soft"
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-ai-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3">Our Values</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base text-muted-foreground">
                {[
                  { title: "Transparency", desc: "We are open about how our AI works and where opportunities come from." },
                  { title: "Accessibility", desc: "Free to use, mobile-friendly, and built for all South African youth." },
                  { title: "Real Impact", desc: "We measure success by meaningful outcomes, not vanity metrics." },
                  { title: "Privacy", desc: "Your data is protected and handled with care." },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-ai-gradient rounded-2xl p-5 sm:p-8 text-white shadow-glow"
        >
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Get in Touch</h2>
          <p className="mb-5 sm:mb-6 opacity-90 text-sm sm:text-base">
            Have questions or want to partner with us? We would love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="mailto:support@empowerai.co.za"
              className="flex items-center justify-center sm:justify-start gap-2 bg-white text-primary px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-md"
            >
              <Mail className="h-5 w-5" />
              support@empowerai.co.za
            </a>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-white/90">
              <MapPin className="h-5 w-5" />
              <span>South Africa</span>
            </div>
          </div>
        </motion.section>

        <div className="text-center mt-6 sm:mt-8">
          <Button asChild variant="outline" size="lg">
            <Link to="/">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
