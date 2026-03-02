import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Zap,
  TrendingUp,
  Target,
  Users,
  FileText,
  Mic,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Sparkles,
  X,
  Menu,
  Briefcase,
  Shield,
  Star,
  Award,
  Play,
  ChevronRight,
} from "lucide-react"
import ThemeToggle from "../components/ThemeToggle"
import Logo from "../components/Logo"
import { cn } from "../lib/utils"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #d4d4d4 1px, transparent 1px), linear-gradient(to bottom, #d4d4d4 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
          }}
        />
      </div>

      {/* Navigation - Premium */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-[#e5e5e5] dark:border-[#262626]" 
          : "bg-transparent border-transparent"
      )}>
        <div className="premium-container">
          <div className="flex items-center justify-between h-16">
            <Logo variant="dark" size="lg" linkTo="/" />
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Success</a>
              <ThemeToggle />
              <Link to="/login" className="text-sm font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Sign In</Link>
              <Link to="/signup" className="premium-btn premium-btn-primary">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-[#262626] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#e5e5e5] dark:border-[#262626]">
            <div className="premium-container py-4 space-y-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#262626] font-medium transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#262626] font-medium transition-colors">How It Works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#262626] font-medium transition-colors">Success Stories</a>
              <div className="pt-4 space-y-2 border-t border-[#e5e5e5] dark:border-[#262626]">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-center rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#262626] font-medium transition-colors">Sign In</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="premium-btn premium-btn-primary w-full">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - World-Class */}
      <section className="premium-section pt-32 md:pt-40">
        <div className="premium-container">
          <div className="max-w-4xl mx-auto text-center premium-animate-in">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fafafa] dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] mb-6">
              <Sparkles className="h-3.5 w-3.5 text-[#2563eb]" />
              <span className="text-xs font-medium text-[#525252] dark:text-[#a3a3a3]">Empowering SA Youth Since 2024</span>
            </div>

            {/* Hero Heading */}
            <h1 className="premium-heading-1 mb-6">
              Your AI-Powered Path to{" "}
              <span className="premium-gradient-text">Economic Freedom</span>
            </h1>

            {/* Hero Description */}
            <p className="premium-body-large max-w-2xl mx-auto mb-8">
              Transform your career with AI-driven CV analysis, interview coaching, and personalized career guidance. Built for South African youth.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup" className="premium-btn premium-btn-primary premium-hover-lift px-8 py-3 text-base">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="premium-btn premium-btn-secondary px-8 py-3 text-base">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#737373] dark:text-[#737373]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>1,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>10K+ CVs Analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>95% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Grid */}
      <section id="features" className="premium-section">
        <div className="premium-container">
          <div className="text-center mb-16">
            <div className="premium-badge premium-badge-primary mb-4">Features</div>
            <h2 className="premium-heading-2 mb-4">Everything You Need to Succeed</h2>
            <p className="premium-body-large max-w-2xl mx-auto">
              Powerful AI tools designed specifically for South African job seekers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "AI CV Analyzer",
                description: "Get instant feedback on your CV with ATS compatibility, keyword optimization, and SA market insights.",
                color: "#2563eb"
              },
              {
                icon: Mic,
                title: "Interview Coach",
                description: "Practice with AI-powered mock interviews. Get real-time feedback and improve your confidence.",
                color: "#06b6d4"
              },
              {
                icon: Users,
                title: "Digital Twin",
                description: "Create your digital career profile and simulate different career paths with AI predictions.",
                color: "#10b981"
              },
              {
                icon: BarChart3,
                title: "Career Simulations",
                description: "Explore potential career paths, salary projections, and skills needed for your dream job.",
                color: "#f59e0b"
              },
              {
                icon: Briefcase,
                title: "SA Job Matching",
                description: "Find opportunities matched to your skills across all 9 provinces with real salary data.",
                color: "#8b5cf6"
              },
              {
                icon: Shield,
                title: "24/7 AI Support",
                description: "Get career guidance anytime with our AI mentor. Available in 11 South African languages.",
                color: "#ef4444"
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="premium-card premium-card-interactive premium-animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-lg w-fit mb-4" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">{feature.title}</h3>
                <p className="premium-body-small">{feature.description}</p>
                <button className="mt-4 text-sm font-medium flex items-center gap-1 group" style={{ color: feature.color }}>
                  Learn more
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Clean */}
      <section className="premium-section bg-[#fafafa] dark:bg-[#171717]">
        <div className="premium-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "63%", label: "Youth Unemployment in SA" },
              { number: "1,000+", label: "Users Empowered" },
              { number: "10K+", label: "Career Paths Analyzed" },
              { number: "24/7", label: "AI Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="premium-heading-2 mb-2 premium-gradient-text">{stat.number}</div>
                <div className="premium-body-small">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section id="how-it-works" className="premium-section">
        <div className="premium-container">
          <div className="text-center mb-16">
            <div className="premium-badge premium-badge-primary mb-4">How It Works</div>
            <h2 className="premium-heading-2 mb-4">Your Journey to Success</h2>
            <p className="premium-body-large max-w-2xl mx-auto">
              Three simple steps to transform your career prospects
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: "01",
                title: "Upload Your CV",
                description: "Our AI analyzes your skills, experience, and qualifications in seconds. Get instant feedback on ATS compatibility and keyword optimization.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Build Your Digital Twin",
                description: "Create your personalized career profile with goals, preferences, and aspirations. Our AI learns about you to provide tailored guidance.",
                icon: Users,
              },
              {
                step: "03",
                title: "Explore & Grow",
                description: "Discover career paths, practice interviews, and find opportunities. Get real-time guidance from your AI mentor as you grow.",
                icon: TrendingUp,
              },
            ].map((step, index) => (
              <div key={index} className="flex gap-8 items-start">
                <div className="hidden md:block">
                  <div className="w-12 h-12 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1 premium-card">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#2563eb]/10">
                      <step.icon className="h-6 w-6 text-[#2563eb]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-[#0a0a0a] dark:text-[#fafafa]">{step.title}</h3>
                      <p className="premium-body">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section id="testimonials" className="premium-section bg-[#fafafa] dark:bg-[#171717]">
        <div className="premium-container">
          <div className="text-center mb-16">
            <div className="premium-badge premium-badge-success mb-4">Success Stories</div>
            <h2 className="premium-heading-2 mb-4">Transforming Lives Across South Africa</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Thabo M.",
                role: "Software Developer",
                location: "Gauteng",
                quote: "EmpowerAI helped me land my first dev job. The CV analyzer was a game-changer!",
                rating: 5,
              },
              {
                name: "Lindiwe K.",
                role: "Marketing Manager",
                location: "Western Cape",
                quote: "The interview coach gave me the confidence I needed. Now earning 30% more!",
                rating: 5,
              },
              {
                name: "Sipho N.",
                role: "Data Analyst",
                location: "KZN",
                quote: "Went from unemployed to employed in 3 months. This platform is incredible!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="premium-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
                  ))}
                </div>
                <p className="premium-body mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#0a0a0a] dark:text-[#fafafa]">{testimonial.name}</div>
                    <div className="text-xs text-[#737373]">{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Premium */}
      <section className="premium-section">
        <div className="premium-container">
          <div className="premium-card max-w-4xl mx-auto text-center p-12 premium-gradient">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of South African youth who are building better futures with AI-powered career guidance.
            </p>
            <Link to="/signup" className="premium-btn bg-white text-[#2563eb] hover:bg-white/90 px-8 py-3 text-base font-semibold">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Clean */}
      <footer className="border-t border-[#e5e5e5] dark:border-[#262626] py-12">
        <div className="premium-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-sm text-[#0a0a0a] dark:text-[#fafafa]">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-[#0a0a0a] dark:text-[#fafafa]">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">About</Link></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-[#0a0a0a] dark:text-[#fafafa]">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Docs</a></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-[#0a0a0a] dark:text-[#fafafa]">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#e5e5e5] dark:border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#737373]">
              © 2024 EmpowerAI. Built by Team Tech Bridle.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-[#737373] hover:text-[#0a0a0a] dark:hover:text-[#fafafa] transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
