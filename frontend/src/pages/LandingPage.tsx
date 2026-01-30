// pages/LandingPage.tsx
import { useState, useEffect, useLayoutEffect } from "react"
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
  Bot,
  Menu,
  Briefcase,
} from "lucide-react"
import ThemeToggle from "../components/ThemeToggle"
import Logo from "../components/Logo"
import DigitalTwinChatbot from "../components/DigitalTwinChatbot"
import { cn } from "../lib/utils"

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

 useLayoutEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 800)
    setWindowWidth(window.innerWidth)
  }

  checkMobile()
  window.addEventListener("resize", checkMobile)

  return () => window.removeEventListener("resize", checkMobile)
}, [])

  // Close mobile menu on escape key or outside click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/images/landing.png" 
          alt="" 
          className="w-full h-full object-cover"
          style={{
            opacity: '0.25',
            filter: 'brightness(0.9)',
          }}
          aria-hidden="true"
        />
        {/* Overlay gradient for better content readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/70 to-cyan-50/80 dark:from-slate-900/75 dark:via-slate-800/75 dark:to-slate-900/75"></div>
        
        {/* Animated gradient orbs - light mode */}
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-soft"></div>
        <div className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-indigo-300/15 dark:bg-indigo-400/10 rounded-full blur-[110px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        
        {/* Dark mode subtle stars */}
        <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}></div>
      
      {/* Subtle wave pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-64 opacity-[0.03]">
        <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="url(#waveGradient)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo variant="dark" size="md" linkTo="/" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-sm py-2">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-sm py-2">
                How It Works
              </a>
              <a href="#demo" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-sm py-2">
                Demo
              </a>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 md:gap-4">
              <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ThemeToggle />
              </div>
              <Link 
                to="/login" 
                className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] flex items-center touch-manipulation"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 min-h-[44px] flex items-center justify-center touch-manipulation"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
              <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ThemeToggle />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMobileMenuOpen(!mobileMenuOpen)
                }}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center touch-manipulation"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Slide down animation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="px-4 py-4 space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-base font-medium py-3.5 px-4 rounded-lg min-h-[52px] flex items-center touch-manipulation"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-base font-medium py-3.5 px-4 rounded-lg min-h-[52px] flex items-center touch-manipulation"
              >
                How It Works
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-base font-medium py-3.5 px-4 rounded-lg min-h-[52px] flex items-center touch-manipulation"
              >
                Demo
              </a>
              <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-base font-medium py-3.5 px-4 rounded-lg min-h-[52px] flex items-center touch-manipulation"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 transition-colors text-base font-semibold py-3.5 px-4 rounded-lg min-h-[52px] flex items-center justify-center touch-manipulation shadow-md mt-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 relative z-20">
        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left w-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm sm:text-sm mb-5 sm:mb-6 md:mb-8 font-medium">
                <Sparkles className="h-4 w-4 sm:h-4 sm:w-4" />
                AI-Powered Career Guidance
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-5 sm:mb-6 md:mb-8 tracking-tight">
                Your Digital
                <span className="text-indigo-600 dark:text-indigo-400">
                  {" "}
                  Economic
                </span>
                <br className="hidden sm:block" />
                Twin Awaits
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mb-6 sm:mb-8 md:mb-10 mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
                Visualize your future earning potential. Get personalized career pathways designed for South African
                youth.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-2 sm:px-0">
                <Link
                  to="/signup"
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] min-h-[48px] sm:min-h-[52px] touch-manipulation"
                >
                  Get Started <ArrowRight className="h-5 w-5 sm:h-5 sm:w-5" />
                </Link>
                <a
                  href="#demo"
                  className="px-6 py-3.5 sm:px-8 sm:py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 text-center text-base sm:text-lg min-h-[48px] sm:min-h-[52px] flex items-center justify-center touch-manipulation"
                >
                  Watch Demo
                </a>
              </div>
            </div>
            <div className="flex-1 relative w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
              <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl mt-10 sm:mt-20 overflow-hidden group">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-cyan-50/50 dark:from-indigo-900/20 dark:to-cyan-900/20 opacity-50"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-900/50">
                      <span className="text-xl sm:text-2xl">≡ƒæñ</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-base sm:text-lg">Asanda, 22</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Soweto, Gauteng</p>
                    </div>
                  </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Empowerment Score</span>
                    <span className="text-indigo-600 font-bold text-lg">78/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800/50 backdrop-blur-sm">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1 font-medium">3-Month Projection</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">R4,200/mo</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800/50 backdrop-blur-sm">
                      <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-1 font-medium">Best Path</p>
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Mentorship</p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-y border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative z-20 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {[
              { icon: Users, value: "63%", label: "Youth Unemployment in SA" },
              { icon: BarChart3, value: "10K+", label: "Career Paths Analyzed" },
              { icon: Target, value: "95%", label: "Accuracy Rate" },
              { icon: Sparkles, value: "24/7", label: "AI Support Available" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                    <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-slate-900 relative z-20 transition-colors">
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive tools for your economic empowerment journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Digital Economic Twin",
                description:
                  "A dynamic AI model that simulates your multiple economic futures based on skills and choices.",
              },
              {
                icon: BarChart3,
                title: "Path Simulation",
                description: "3, 6, and 12-month income projections across different career pathways.",
              },
              {
                icon: FileText,
                title: "CV Analysis",
                description: "AI-powered CV feedback and skill extraction to improve your job applications.",
              },
              {
                icon: Briefcase,
                title: "Opportunity Matching",
                description: "Find jobs, learnerships, and internships tailored to your skills and location.",
              },
              {
                icon: Mic,
                title: "Interview Coach",
                description: "Practice interviews with AI feedback to build confidence and improve performance.",
              },
              {
                icon: Target,
                title: "Personalized Roadmap",
                description: "Get step-by-step guidance on achieving your career and financial goals.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 group"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 relative z-20 transition-colors">
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "1",
                title: "Upload Your CV",
                description: "Our AI analyzes your skills, experience, and qualifications to understand your profile.",
                icon: FileText,
              },
              {
                step: "2",
                title: "Build Your Twin",
                description: "Create your digital economic twin by providing details about your goals and preferences.",
                icon: Zap,
              },
              {
                step: "3",
                title: "Explore Your Future",
                description: "Visualize income projections, explore career paths, and find opportunities matched to you.",
                icon: TrendingUp,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                    <span className="text-white font-bold text-lg">{item.step}</span>
                  </div>
                  <div className="mt-6 mb-4 flex justify-center">
                    <div className="h-16 w-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 text-center">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-slate-900 relative z-20 transition-colors">
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 tracking-tight">
              See It In Action
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Watch how EmpowerAI helps South African youth visualize and achieve their economic goals.
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 sm:p-12 shadow-xl">
            <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Demo video coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900 dark:bg-slate-950 text-slate-300 relative z-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <Logo variant="light" size="md" linkTo="/" />
              <p className="mt-4 text-sm text-slate-400">
                Empowering South African youth through AI-driven career guidance and economic planning.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 EmpowerAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
