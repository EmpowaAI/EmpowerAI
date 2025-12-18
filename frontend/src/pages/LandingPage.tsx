"use client"

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-700 bg-fixed relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
            <path fill="rgba(139, 92, 246, 0.3)" d="M0,400 Q360,320 720,400 T1440,400 L1440,800 L0,800 Z" />
            <path fill="rgba(139, 92, 246, 0.2)" d="M0,500 Q360,420 720,500 T1440,500 L1440,800 L0,800 Z" />
          </svg>
        </div>
      </div>

     <div
  className="absolute inset-x-0 top-0 bg-[url('/images/landing.png')] bg-cover bg-no-repeat opacity-80"
  style={{
    backgroundAttachment: isMobile ? "scroll" : "fixed",
    height: isMobile 
      ? (windowWidth < 500 ? "450px" : "400px") 
      : "600px",
    backgroundPosition: isMobile ? "80% center" : "200% center",
    paddingBottom: isMobile ? "2rem" : "0",
  }}
></div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EmpowerAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#demo" className="text-white/80 hover:text-white transition-colors">
              Demo
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-white/80 hover:text-white transition-colors text-sm sm:text-base">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 relative z-10">
        <div className="mx-auto max-w-7xl relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm mb-4 sm:mb-6 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                AI-Powered Career Guidance
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
                Your Digital
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {" "}
                  Economic
                </span>
                <br className="hidden sm:block" />
                Twin Awaits
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl mb-6 sm:mb-8 mx-auto lg:mx-0">
                Visualize your future earning potential. Get personalized career pathways designed for South African
                youth.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-purple-500/50"
                >
                  Get Started <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
                <a
                  href="#demo"
                  className="px-4 py-2 sm:px-6 sm:py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors text-center text-sm sm:text-base backdrop-blur-sm"
                >
                  Watch Demo
                </a>
              </div>
            </div>
            <div className="flex-1 relative w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-teal-500/30 blur-[100px] rounded-full"></div>
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl mt-10 sm:mt-20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-teal-400/20 flex items-center justify-center">
                    <span className="text-base sm:text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm sm:text-base">Asanda, 22</p>
                    <p className="text-xs sm:text-sm text-white/70">Soweto, Gauteng</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs sm:text-sm">Empowerment Score</span>
                    <span className="text-cyan-400 font-bold text-sm sm:text-base">78/100</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                      <p className="text-xs sm:text-sm text-white/70">3-Month Projection</p>
                      <p className="text-lg sm:text-xl font-bold text-green-400">R4,200/mo</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                      <p className="text-xs sm:text-sm text-white/70">Best Path</p>
                      <p className="text-lg sm:text-xl font-bold text-purple-400">Mentorship</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 border-y border-white/10 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: Users, value: "63%", label: "Youth Unemployment in SA" },
              { icon: BarChart3, value: "10K+", label: "Career Paths Analyzed" },
              { icon: Target, value: "95%", label: "Accuracy Rate" },
              { icon: Sparkles, value: "24/7", label: "AI Support Available" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
              Our AI-powered platform provides comprehensive tools for your economic empowerment journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] hover:bg-white/15"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-sm">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">How It Works</h2>
            <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
              Get started in minutes and see your future unfold.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { step: "01", title: "Create Profile", desc: "Enter your skills, education, and interests" },
              { step: "02", title: "Build Your Twin", desc: "AI generates your economic digital twin" },
              { step: "03", title: "Run Simulations", desc: "Compare different career pathways" },
              { step: "04", title: "Take Action", desc: "Follow your personalized roadmap" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md"></div>
                  <div className="relative text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-300/40">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-white/70 text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="mx-auto max-w-4xl relative">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
              Meet Asanda from Soweto
            </h2>
            <div className="space-y-3 sm:space-y-4 text-white/70 text-sm sm:text-base">
              <p>
                Asanda, 22, uploads her CV and enters her interests. EmpowerAI builds a digital version of her — her
                Economic Twin.
              </p>
              <p>
                The twin runs simulations for learnerships, freelancing, a Web Design course, and entry-level support
                roles.
              </p>
              <p className="text-white font-medium">
                It shows her the best path: Freelancing + learnership → R4,200/month by Month 3.
              </p>
              <p>In 20 seconds, she sees her future clearly.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
              {["Income Projections", "Career Roadmap", "Interview Prep", "Local Opportunities"].map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 sm:px-3 sm:py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  <span className="text-white">{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="mx-auto max-w-4xl text-center relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to See Your Future?
          </h2>
          <p className="text-white/70 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
            Join thousands of South African youth taking control of their economic destiny.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base shadow-purple-500/50"
          >
            Start Your Journey <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
      </section>

      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-white/10 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm sm:text-base">EmpowerAI</span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 text-center">
            Melsoft Academy Hackathon 2025 | Team: Nicolette, Lunga, Eva, Siyanda, Lindy
          </p>
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
