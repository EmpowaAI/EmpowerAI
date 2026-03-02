// LandingPage.tsx - Enhanced Original Design
import React, { useState, useEffect } from "react"
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
  X,
  Menu,
  Briefcase,
  Shield,
  Star,
  Award,
  Play,
  Brain,
  ArrowUp,
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

  const testimonials = [
    {
      name: "Lerato M.",
      location: "Cape Town",
      role: "Student ? Software Developer",
      quote: "EmpowerAI helped me discover tech skills I didn't know I had. I'm now earning R12k/month!",
      rating: 5
    },
    {
      name: "Sipho K.",
      location: "Durban",
      role: "Unemployed ? Business Owner",
      quote: "The career simulation showed me entrepreneurship was my path. Best decision I ever made!",
      rating: 5
    },
    {
      name: "Nomsa T.",
      location: "Johannesburg",
      role: "Waitress ? Marketing Pro",
      quote: "From minimum wage to a career I love. The AI guidance was truly life-changing!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Hero Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-slate-200/10 to-slate-300/10 dark:from-slate-700/10 dark:to-slate-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-slate-300/10 to-slate-400/10 dark:from-slate-600/10 dark:to-slate-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100/5 dark:bg-slate-800/5 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-slate-800/50" 
          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Logo variant="dark" size="lg" linkTo="/" />
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-all duration-200 text-sm relative group">Features <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 group-hover:w-full transition-all duration-200"></span></a>
              <a href="#how-it-works" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-all duration-200 text-sm relative group">How It Works <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 group-hover:w-full transition-all duration-200"></span></a>
              <a href="#demo" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-all duration-200 text-sm relative group">Demo <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 group-hover:w-full transition-all duration-200"></span></a>
              <a href="#testimonials" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-all duration-200 text-sm relative group">Success Stories <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 group-hover:w-full transition-all duration-200"></span></a>
              <ThemeToggle />
              <Link to="/login" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-all duration-200 text-sm px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Sign In</Link>
              <Link to="/signup" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-sm">Get Started</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 h-10 w-10 flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="px-4 py-6 space-y-2 max-w-7xl mx-auto">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 text-slate-700 dark:text-slate-300">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 text-slate-700 dark:text-slate-300">How It Works</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 text-slate-700 dark:text-slate-300">Demo</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 text-slate-700 dark:text-slate-300">Success Stories</a>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 text-slate-700 dark:text-slate-300">Sign In</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-center transition-all duration-200">Get Started Free</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 lg:pt-40 pb-20 md:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8 relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold animate-fade-in">
                <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
                <span className="whitespace-nowrap">AI-Powered Career Intelligence</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-slate-900 dark:text-white animate-slide-up">
                Transform Your
                <span className="block text-slate-900 dark:text-white">Career Future</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in animation-delay-200">
                See how EmpowerAI is transforming careers across South Africa
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in animation-delay-400">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 w-full sm:w-auto"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-3 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-slate-400 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-400 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-100 w-full sm:w-auto"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Demo</span>
                </a>
              </div>
            </div>

            {/* Right Content - Demo Visual */}
            <div className="relative animate-float mt-8 lg:mt-0">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/50">
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-slate-900 text-white px-4 md:px-6 py-2 rounded-full font-semibold text-xs md:text-sm shadow-lg animate-bounce-slow">
                  Free Forever
                </div>
                
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">Sarah Chen</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Software Developer</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <ArrowUp className="h-6 w-6 text-slate-900 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">85%</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Career Match</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-slate-900 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">R45K</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Salary</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Profile Completion</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-400">92%</span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-slate-900 dark:bg-slate-400 rounded-full animate-progress" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for
              <span className="block text-slate-900 dark:text-white">Career Success</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Everything you need to accelerate your career journey in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-14 w-14 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-7 w-7 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Career Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Advanced AI algorithms analyze your skills, experience, and goals to provide personalized career recommendations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-14 w-14 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Salary Predictions</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Get accurate salary predictions based on your skills, location, and market demand in South Africa.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-14 w-14 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-7 w-7 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">CV Optimization</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                AI-powered CV analysis and optimization to help you stand out to top employers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-14 w-14 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mic className="h-7 w-7 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Interview Coach</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice interviews with AI feedback and improve your confidence for real job interviews.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-14 w-14 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Market Insights</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time labor market data and trends to help you make informed career decisions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-14 w-14 bg-slate-900 dark:bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-7 w-7 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Skill Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Track your skill development and get personalized learning recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Success Stories from
              <span className="block text-slate-900 dark:text-white">South African Youth</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Real stories from real users who transformed their careers with EmpowerAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl rounded-xl md:rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-300 touch-manipulation">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-slate-900 dark:fill-slate-100" />
                  ))}
                </div>
                <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-5 md:mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 md:h-12 md:w-12 flex-shrink-0 rounded-full bg-slate-900 dark:bg-slate-100" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm md:text-base text-slate-900 dark:text-white truncate">{testimonial.name}</p>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 animate-fade-in leading-tight">
            Ready to Transform Your Future?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-200 leading-relaxed">
            Join over 1,000 South African youth building better careers with AI-powered guidance
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 px-8 md:px-10 py-4 md:py-5 rounded-lg font-bold text-base md:text-lg transition-all duration-200 shadow-2xl hover:scale-105 active:scale-100 animate-fade-in animation-delay-400 min-h-[52px] touch-manipulation w-full sm:w-auto max-w-md mx-auto"
          >
            <span>Start Your Journey Free</span>
            <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" size="lg" linkTo="/" />
              <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-400">
                Empowering South African youth through AI-driven career guidance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3 md:mb-4 text-base">Product</h3>
              <ul className="space-y-2 text-sm md:text-base">
                <li><a href="#features" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">How It Works</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">Demo</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3 md:mb-4 text-base">Company</h3>
              <ul className="space-y-2 text-sm md:text-base">
                <li><Link to="/about" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3 md:mb-4 text-base">Get Started</h3>
              <ul className="space-y-2 text-sm md:text-base">
                <li><Link to="/signup" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors min-h-[44px] inline-block py-1">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 md:pt-8 text-center text-xs md:text-sm text-slate-400">
            <p>&copy; 2025 EmpowerAI. All rights reserved. Built with care for South African youth.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
