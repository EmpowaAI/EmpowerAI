// LandingPage.tsx - MOBILE-FIRST with Animated Background
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
  Brain,
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
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* ANIMATED Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/30 to-premium/20 dark:from-slate-950 dark:via-indigo-950/30 dark:to-premium/20" />
        <div className="absolute top-0 -left-48 w-96 h-96 bg-gradient-to-br from-primary/30 to-premium/30 dark:from-primary/20 dark:to-premium/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 -right-48 w-96 h-96 bg-gradient-to-br from-secondary/30 to-primary/30 dark:from-cyan-600/20 dark:to-primary/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-gradient-to-br from-premium/30 to-pink-400/30 dark:from-premium/20 dark:to-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(99, 102, 241) 1px, transparent 1px), linear-gradient(to bottom, rgb(99, 102, 241) 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            animation: 'grid-flow 20s linear infinite'
          }}
        />
      </div>

      {/* Mobile-First Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-sm border-b border-slate-200/50 dark:border-slate-800/50" 
          : "bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg"
      )}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Logo variant="dark" size="lg" linkTo="/" />
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors text-base">Features</a>
              <a href="#how-it-works" className="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors text-base">How It Works</a>
              <a href="#demo" className="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors text-base">Demo</a>
              <a href="#testimonials" className="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors text-base">Success</a>
              <ThemeToggle />
              <Link to="/login" className="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium transition-colors text-base px-4 py-2 min-h-[44px] flex items-center">Sign In</Link>
              <Link to="/signup" className="bg-primary hover:bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-100 min-h-[44px] touch-manipulation w-full sm:w-auto">Get Started</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Enhanced */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="px-4 py-4 space-y-1 max-w-7xl mx-auto">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors min-h-[52px] flex items-center text-base">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors min-h-[52px] flex items-center text-base">How It Works</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block py-3.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors min-h-[52px] flex items-center text-base">Demo</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-3.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors min-h-[52px] flex items-center text-base">Success Stories</a>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2 space-y-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors min-h-[52px] flex items-center text-base">Sign In</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-3.5 px-4 rounded-lg bg-primary hover:bg-primary text-white font-semibold text-center transition-colors min-h-[52px] flex items-center justify-center text-base">Get Started Free</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile-First Hero Section */}
      <section className="relative pt-20 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left Content - Mobile Optimized */}
            <div className="text-center lg:text-left space-y-6 md:space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary dark:bg-primary/50 border border-primary dark:border-primary text-white text-sm md:text-base font-medium animate-fade-in">
                <Sparkles className="w-4 h-4 sm:h-5 sm:w-5 text-white animate-pulse" />
                <span className="whitespace-nowrap">AI-Powered Career Guidance</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-slate-900 dark:text-white animate-slide-up">
                Your Digital
                <span className="block text-primary dark:text-primary">Economic Twin</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in animation-delay-200">
                Visualize your future earning potential. Get personalized career pathways for South African youth.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start animate-fade-in animation-delay-400">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary active:bg-primary text-white px-6 sm:px-8 py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 min-h-[52px] touch-manipulation w-full sm:w-auto"
                >
                  <span>Sign in</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-6 sm:px-8 py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 hover:scale-105 active:scale-100 min-h-[52px] touch-manipulation w-full sm:w-auto"
                >
                  <Play className="h-5 w-5" />
                  <span>Learn More</span>
                </a>
              </div>

              {/* Trust Indicators - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 justify-center lg:justify-start pt-4 animate-fade-in animation-delay-600">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-primary to-primary border-2 border-white dark:border-slate-900" />
                    ))}
                  </div>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">1,000+ users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 md:h-6 md:w-6 fill-primary text-primary" />
                  ))}
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium ml-1.5">4.9/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">Bank-level security</span>
                </div>
              </div>
            </div>

            {/* Right Content - Mobile-First Card */}
            <div className="relative animate-float mt-8 lg:mt-0">
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/50">
                <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-primary text-white px-4 md:px-6 py-2 rounded-full font-semibold text-xs md:text-sm shadow-lg animate-bounce-slow">
                  Free Forever
                </div>
                
                <div className="space-y-5 md:space-y-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-14 w-14 md:h-16 md:w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center">
                      <span className="text-2xl">??</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-base md:text-lg text-slate-900 dark:text-white truncate">Thabo Ndlovu, 23</p>
                      <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Johannesburg, GP</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">Empowerment Score</span>
                      <span className="text-xl md:text-2xl font-bold text-primary dark:text-primary">82/100</span>
                    </div>
                    <div className="h-3 md:h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[82%] bg-gradient-to-r from-primary to-primary dark:from-primary dark:to-primary rounded-full animate-progress" />
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
              <span className="block text-primary dark:text-primary">Career Success</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Everything you need to accelerate your career journey in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border border-primary/20 dark:border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Career Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Advanced AI algorithms analyze your skills, experience, and goals to provide personalized career recommendations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 dark:from-secondary/20 dark:to-accent/20 border border-secondary/20 dark:border-secondary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Salary Predictions</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Get accurate salary predictions based on your skills, location, and market demand in South Africa.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 border border-accent/20 dark:border-accent/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">CV Optimization</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                AI-powered CV analysis and optimization to help you stand out to top employers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 border border-primary/20 dark:border-accent/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Interview Coach</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice interviews with AI feedback and improve your confidence for real job interviews.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 dark:from-secondary/20 dark:to-accent/20 border border-secondary/20 dark:border-secondary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Market Insights</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time labor market data and trends to help you make informed career decisions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 border border-accent/20 dark:border-accent/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="h-12 w-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-6 w-6 text-white" />
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
              <span className="block text-primary dark:text-primary">South African Youth</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Real stories from real users who transformed their careers with EmpowerAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            {[
              { name: "Lerato M.", location: "Cape Town", role: "Student ? Software Developer", quote: "EmpowerAI helped me discover tech skills I didn't know I had. I'm now earning R12k/month!", rating: 5 },
              { name: "Sipho K.", location: "Durban", role: "Unemployed ? Business Owner", quote: "The career simulation showed me entrepreneurship was my path. Best decision I ever made!", rating: 5 },
              { name: "Nomsa T.", location: "Johannesburg", role: "Waitress ? Marketing Pro", quote: "From minimum wage to a career I love. The AI guidance was truly life-changing!", rating: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl rounded-xl md:rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-300 touch-manipulation">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-5 md:mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 md:h-12 md:w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary" />
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

      {/* Mobile-First CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-indigo-700 to-premium dark:from-primary dark:via-indigo-950 dark:to-premium relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 animate-fade-in leading-tight">
            Ready to Transform Your Future?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-200 leading-relaxed">
            Join over 1,000 South African youth building better careers with AI-powered guidance
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-primary px-8 md:px-10 py-4 md:py-5 rounded-lg font-bold text-base md:text-lg transition-all duration-200 shadow-2xl hover:scale-105 active:scale-100 animate-fade-in animation-delay-400 min-h-[52px] touch-manipulation w-full sm:w-auto max-w-md mx-auto"
          >
            <span>Start Your Journey Free</span>
            <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
          </Link>
        </div>
      </section>

      {/* Mobile-First Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300 dark:text-slate-400 py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
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
