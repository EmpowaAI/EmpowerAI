// LandingPage.tsx - Professional, Clean, Beautiful
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
    <div className="min-h-screen bg-white dark:bg-slate-950 relative">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 pointer-events-none" />
      
      {/* Subtle Accent Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-sm border-b border-slate-200 dark:border-slate-800" 
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Logo variant="dark" size="lg" linkTo="/" />
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Success Stories
              </a>
              <ThemeToggle />
              <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md">
                Get Started
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
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">How It Works</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">Success Stories</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">Sign In</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-center transition-colors">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Career Guidance for SA Youth
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-slate-900 dark:text-white">
                Your Digital
                <span className="block text-indigo-600 dark:text-indigo-400">Economic Twin</span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Visualize your future earning potential. Get personalized career pathways designed specifically for South African youth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 justify-center lg:justify-start flex-wrap pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-2 border-white dark:border-slate-900" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">1,000+ users</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-indigo-500 text-indigo-500" />
                  ))}
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right Content - Clean Feature Card */}
            <div className="relative">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="absolute -top-4 -right-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg">
                  Free Forever
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">Thabo Ndlovu, 23</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Johannesburg, GP</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Empowerment Score</span>
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">82/100</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[82%] bg-indigo-600 dark:bg-indigo-500 rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Income Potential</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">R8,500<span className="text-sm font-normal text-slate-500">/mo</span></p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Recommended Path</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">Tech Skills</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 pt-2">
                    <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span>CV analyzed in 60 seconds</span>
                  </div>
                </div>
              </div>

              {/* Floating Success Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                    <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">95% Success Rate</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Career matching</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { icon: Users, value: "63%", label: "Youth Unemployment", sublabel: "in South Africa" },
              { icon: Target, value: "1,000+", label: "Users Empowered", sublabel: "and growing" },
              { icon: BarChart3, value: "10K+", label: "Career Paths", sublabel: "analyzed" },
              { icon: Zap, value: "24/7", label: "AI Support", sublabel: "always available" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 mb-4">
                  <stat.icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{stat.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to <span className="text-indigo-600 dark:text-indigo-400">Succeed</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Comprehensive AI-powered tools designed specifically for South African youth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: "Digital Economic Twin", description: "AI-powered simulation of your economic future based on your skills and career choices" },
              { icon: BarChart3, title: "Path Simulation", description: "Visualize 3, 6, and 12-month income projections across different career pathways" },
              { icon: FileText, title: "CV Analysis", description: "Get instant AI feedback to improve your CV and job applications" },
              { icon: Briefcase, title: "Opportunity Matching", description: "Find jobs, learnerships, and internships tailored to your profile" },
              { icon: Mic, title: "Interview Coach", description: "Practice with AI feedback to build confidence and improve performance" },
              { icon: Shield, title: "Career Roadmap", description: "Step-by-step guidance to achieve your career and financial goals" },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Get Started in <span className="text-indigo-600 dark:text-indigo-400">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Your journey to economic empowerment begins here
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload Your CV", description: "Our AI analyzes your skills, experience, and qualifications in seconds", icon: FileText },
              { step: "2", title: "Build Your Twin", description: "Create your digital economic profile with personalized goals", icon: Zap },
              { step: "3", title: "Explore Your Future", description: "Discover career paths, income projections, and opportunities", icon: TrendingUp },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{item.step}</span>
                  </div>
                  <div className="mt-8 mb-6 flex justify-center">
                    <div className="h-16 w-16 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 text-center">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Real <span className="text-indigo-600 dark:text-indigo-400">Success Stories</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See how EmpowerAI is transforming careers across South Africa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Lerato M.", location: "Cape Town", role: "Student → Software Developer", quote: "EmpowerAI helped me discover tech skills I didn't know I had. I'm now earning R12k/month!", rating: 5 },
              { name: "Sipho K.", location: "Durban", role: "Unemployed → Business Owner", quote: "The career simulation showed me entrepreneurship was my path. Best decision I ever made!", rating: 5 },
              { name: "Nomsa T.", location: "Johannesburg", role: "Waitress → Marketing Professional", quote: "From minimum wage to a career I love. The AI guidance was truly life-changing!", rating: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-indigo-500 text-indigo-500" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-indigo-100 dark:text-indigo-200 mb-8 max-w-2xl mx-auto">
            Join over 1,000 South African youth building better careers with AI-powered guidance
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 px-10 py-5 rounded-lg font-bold text-lg transition-all duration-200 shadow-xl hover:scale-105"
          >
            Start Your Journey Free
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo variant="light" size="lg" linkTo="/" />
              <p className="mt-4 text-sm leading-relaxed">
                Empowering South African youth through AI-driven career guidance and economic planning.
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
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
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
            <p>&copy; 2025 EmpowerAI. All rights reserved. Built with care for South African youth.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
