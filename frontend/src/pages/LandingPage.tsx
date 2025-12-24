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
} from "lucide-react"
import ThemeToggle from "../components/ThemeToggle"

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

 useLayoutEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 800)
    setWindowWidth(window.innerWidth)
  }

  checkMobile()
  window.addEventListener("resize", checkMobile)

  return () => window.removeEventListener("resize", checkMobile)
}, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="/images/result.jpg" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.15] dark:opacity-[0.08] transition-opacity duration-500"
          aria-hidden="true"
        />
        {/* Overlay gradient for better content readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 via-white/80 to-cyan-50/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95"></div>
        
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

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">EmpowerAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              How It Works
            </a>
            <a href="#demo" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              Demo
            </a>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link to="/login" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors text-sm sm:text-base">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 text-sm sm:text-base shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 relative z-20">
        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs sm:text-sm mb-6 sm:mb-8 font-medium">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                AI-Powered Career Guidance
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-6 sm:mb-8 tracking-tight">
                Your Digital
                <span className="text-indigo-600 dark:text-indigo-400">
                  {" "}
                  Economic
                </span>
                <br className="hidden sm:block" />
                Twin Awaits
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mb-8 sm:mb-10 mx-auto lg:mx-0 leading-relaxed">
                Visualize your future earning potential. Get personalized career pathways designed for South African
                youth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-lg shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  Get Started <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <a
                  href="#demo"
                  className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 text-center text-base sm:text-lg"
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
                      <span className="text-xl sm:text-2xl">👤</span>
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
                icon: Target,
                title: "Economic Roadmap",
                description: "Personalized visual journey showing steps, milestones, and required skills.",
              },
              {
                icon: FileText,
                title: "AI CV Analyzer",
                description: "Extract skills, identify gaps, and generate improved versions of your CV.",
              },
              {
                icon: Users,
                title: "Job Fit Matching",
                description: "Match with realistic SA opportunities including learnerships and bursaries.",
              },
              {
                icon: Mic,
                title: "Interview Coach",
                description: "Practice with AI-powered interview simulations and get confidence feedback.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.02] group relative overflow-hidden"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 flex items-center justify-center mb-4 relative shadow-lg border border-indigo-200/50 dark:border-indigo-700/50 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50 relative z-20 transition-colors">
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 tracking-tight">How It Works</h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get started in minutes and see your future unfold.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: "01", title: "Create Profile", desc: "Enter your skills, education, and interests" },
              { step: "02", title: "Build Your Twin", desc: "AI generates your economic digital twin" },
              { step: "03", title: "Run Simulations", desc: "Compare different career pathways" },
              { step: "04", title: "Take Action", desc: "Follow your personalized roadmap" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {item.step}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-slate-900 relative z-20 transition-colors">
        <div className="mx-auto max-w-4xl relative">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 sm:p-10 md:p-12 shadow-lg">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6 sm:mb-8 tracking-tight">
              Meet Asanda from Soweto
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              <p>
                Asanda, 22, uploads her CV and enters her interests. EmpowerAI builds a digital version of her — her
                Economic Twin.
              </p>
              <p>
                The twin runs simulations for learnerships, freelancing, a Web Design course, and entry-level support
                roles.
              </p>
              <p className="text-slate-900 dark:text-slate-100 font-semibold">
                It shows her the best path: Freelancing + learnership → R4,200/month by Month 3.
              </p>
              <p>In 20 seconds, she sees her future clearly.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {["Income Projections", "Career Roadmap", "Interview Prep", "Local Opportunities"].map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-indigo-600 dark:bg-indigo-700 relative z-20 transition-colors">
        <div className="mx-auto max-w-4xl text-center relative">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 tracking-tight">
            Ready to See Your Future?
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 sm:mb-10 max-w-xl mx-auto">
            Join thousands of South African youth taking control of their economic destiny.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] text-base sm:text-lg"
          >
            Start Your Journey <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
        </div>
      </section>

      <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 relative z-20 transition-colors">
        <div className="mx-auto max-w-7xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">EmpowerAI</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xs">
                Empowering South African youth to visualize and achieve their economic potential through AI-powered career guidance.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wide">Quick Links</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Features</a>
                <a href="#how-it-works" className="block text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">How It Works</a>
                <a href="#demo" className="block text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Demo</a>
                <Link to="/signup" className="block text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">Get Started</Link>
              </div>
            </div>

            {/* Empowerment Message */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wide">Your Future Starts Here</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Join thousands of young South Africans taking control of their economic destiny. Build your digital twin, explore career paths, and unlock your potential.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              © 2025 EmpowerAI. Built with ❤️ for South African youth.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Techridle Team
            </p>
          </div>
        </div>
      </footer>

      <DigitalTwinChatbot />
    </div>
  )
}

function DigitalTwinChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPulsing, setIsPulsing] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 3000)

    const hideTimer = setTimeout(() => {
      setShowTooltip(false)
    }, 8000)

    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    setIsPulsing(false)
    setShowTooltip(false)
  }

  return (
    <>
      <div className={`fixed z-50 ${isMobile ? "bottom-4 right-4" : "bottom-6 right-6"}`}>
        {showTooltip && !isOpen && (
          <div
            className={`absolute bg-white text-gray-900 px-3 py-2 rounded-lg shadow-lg animate-bounce whitespace-nowrap ${isMobile ? "bottom-16 right-0" : "bottom-20 right-0"}`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium">Meet your Digital Twin!</span>
            </div>
            <div
              className={`absolute ${isMobile ? "-bottom-2 right-4" : "-bottom-2 right-6"} w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white`}
            />
          </div>
        )}

        <button
          onClick={handleOpen}
          className={`group relative rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center overflow-hidden ${isMobile ? "h-12 w-12" : "h-16 w-16"}`}
        >
          {isPulsing && (
            <>
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
              <span className="absolute inset-[-4px] rounded-full border-2 border-primary/30 animate-pulse" />
            </>
          )}

          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary to-secondary opacity-80" />

          <div className="relative z-10 flex items-center justify-center">
            <div className="relative">
              <Bot className={isMobile ? "h-5 w-5 text-white" : "h-7 w-7 text-white"} />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse border border-white" />
            </div>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden ${isMobile ? "w-full max-w-sm" : "w-full max-w-md"} max-h-[80vh] flex flex-col`}
          >
            <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Your Digital Twin</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                  <p className="text-sm text-gray-800">
                    Hi! I'm your Digital Economic Twin. I can help you explore career paths, simulate your future
                    earnings, and guide you towards economic empowerment. What would you like to know?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-medium hover:opacity-90 transition-opacity text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
