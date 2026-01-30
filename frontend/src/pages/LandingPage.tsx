// LandingPage.tsx - Beautiful, Professional, User-Friendly
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
  Bot,
  Star,
  Award,
  Shield,
  Clock,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50 dark:border-slate-700/50" 
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Logo variant={scrolled ? "dark" : "dark"} size="lg" linkTo="/" />
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Success Stories
              </a>
              <ThemeToggle />
              <Link to="/login" className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">How It Works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">Success Stories</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">Sign In</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-center">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Career Guidance for SA Youth
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">
                  Your Digital Economic Twin
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">Awaits You</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Visualize your future earning potential. Get personalized career pathways designed specifically for South African youth. Start your journey to economic empowerment today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 justify-center lg:justify-start flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 border-2 border-white dark:border-slate-900" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">1,000+ users empowered</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Card */}
            <div className="relative">
              <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg">
                  Free Forever
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Thabo, 23</p>
                      <p className="text-sm text-slate-500">Johannesburg, GP</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Empowerment Score</span>
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">82/100</span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[82%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Income Potential</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">R8,500/mo</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                      <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-1">Top Path</p>
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Tech Skills</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>CV analyzed in 60 seconds</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">95% Success Rate</p>
                    <p className="text-xs text-slate-500">Career matching accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "63%", label: "Youth Unemployment Rate", color: "from-red-500 to-orange-500" },
              { icon: Target, value: "1,000+", label: "Users Empowered", color: "from-indigo-500 to-purple-500" },
              { icon: BarChart3, value: "10K+", label: "Career Paths Analyzed", color: "from-cyan-500 to-blue-500" },
              { icon: Clock, value: "24/7", label: "AI Support", color: "from-green-500 to-emerald-500" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br mb-4", stat.color)}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Succeed</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Powerful AI tools designed specifically for South African youth to navigate their career journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Digital Economic Twin",
                description: "AI-powered simulation of your economic future based on skills and choices",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: BarChart3,
                title: "Path Simulation",
                description: "3, 6, and 12-month income projections across career pathways",
                color: "from-cyan-500 to-blue-500"
              },
              {
                icon: FileText,
                title: "CV Analysis",
                description: "Instant AI feedback to improve your job applications",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Briefcase,
                title: "Opportunity Matching",
                description: "Jobs, learnerships, internships tailored to you",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Mic,
                title: "Interview Coach",
                description: "Practice with AI feedback to build confidence",
                color: "from-pink-500 to-rose-500"
              },
              {
                icon: Shield,
                title: "Career Roadmap",
                description: "Step-by-step guidance to achieve your goals",
                color: "from-purple-500 to-indigo-500"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Get Started in <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Your journey to economic empowerment begins here
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload Your CV", description: "AI analyzes your skills in seconds", icon: FileText },
              { step: "2", title: "Build Your Twin", description: "Create your digital economic profile", icon: Zap },
              { step: "3", title: "Explore Your Future", description: "Discover personalized career paths", icon: TrendingUp },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{item.step}</span>
                  </div>
                  <div className="mt-8 mb-6 flex justify-center">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 text-center">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-center">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Success <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Stories</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Real results from South African youth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Lerato M.", role: "Student → Software Dev", quote: "EmpowerAI helped me discover tech skills I didn't know I had. Now I'm earning R12k/month!", rating: 5 },
              { name: "Sipho K.", role: "Unemployed → Business Owner", quote: "The career simulation showed me entrepreneurship was my path. Best decision ever!", rating: 5 },
              { name: "Nomsa T.", role: "Waitress → Marketing Pro", quote: "From minimum wage to a career I love. The AI guidance was life-changing!", rating: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-indigo-950/30 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join 1,000+ South African youth building better careers with AI
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all duration-200 shadow-2xl hover:scale-105"
          >
            Start Your Journey Free
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo variant="light" size="lg" linkTo="/" />
              <p className="mt-4 text-sm">
                Empowering South African youth through AI-driven career guidance
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 EmpowerAI. All rights reserved. Built with ❤️ for South African youth.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
