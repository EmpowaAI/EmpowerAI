import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Zap, TrendingUp, Target, FileText, Mic, ArrowRight, CheckCircle, BarChart3, Sparkles, Menu, X } from "lucide-react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">EmpowerAI</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600">Features</a>
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600">How It Works</a>
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600">Sign In</Link>
              <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">How It Works</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300">Sign In</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-2 bg-indigo-600 text-white text-center rounded-lg">Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Career Guidance
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                Your Digital
                <span className="text-indigo-600"> Economic </span>
                Twin Awaits
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-8">
                Visualize your future earning potential. Get personalized career pathways designed for South African youth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#demo" className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 text-center">
                  Watch Demo
                </a>
              </div>
            </div>

            {/* Hero Card */}
            <div className="flex-1 w-full max-w-md">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Asanda, 22</p>
                    <p className="text-sm text-slate-500">Soweto, Gauteng</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 text-sm">Empowerment Score</span>
                    <span className="text-indigo-600 font-bold text-lg">78/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">3-Month Projection</p>
                      <p className="text-xl font-bold text-emerald-600">R4,200/mo</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                      <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-1">Top Path</p>
                      <p className="text-xl font-bold text-indigo-600">Freelancing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to build and visualize your economic future
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Digital Economic Twin", desc: "AI-powered digital representation of your economic potential" },
              { icon: TrendingUp, title: "Income Projections", desc: "See your earning potential across different career paths" },
              { icon: FileText, title: "CV Analysis", desc: "Get AI-powered feedback to improve your CV" },
              { icon: Mic, title: "Interview Coach", desc: "Practice interviews with AI-powered feedback" },
              { icon: BarChart3, title: "Path Simulations", desc: "Compare different career paths and their outcomes" },
              { icon: Zap, title: "Opportunities", desc: "Discover real opportunities matched to your skills" },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Build your digital twin in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload Your CV", desc: "Share your skills, education, and experience with our AI." },
              { step: "2", title: "Build Your Twin", desc: "Answer a few questions to create your personalized digital economic twin." },
              { step: "3", title: "Explore Your Future", desc: "Visualize income projections, explore career paths, and find opportunities." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
              Meet Asanda from Soweto
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p>Asanda, 22, uploads her CV and enters her interests. EmpowerAI builds a digital version of her — her Economic Twin.</p>
              <p>The twin runs simulations for learnerships, freelancing, a Web Design course, and entry-level support roles.</p>
              <p className="text-slate-900 dark:text-white font-semibold">It shows her the best path: Freelancing + learnership → R4,200/month by Month 3.</p>
              <p>In 20 seconds, she sees her future clearly.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {["Income Projections", "Career Roadmap", "Interview Prep", "Local Opportunities"].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-indigo-600">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to See Your Future?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">
            Join thousands of South African youth taking control of their economic destiny.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50">
            Start Your Journey <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">EmpowerAI</span>
            </div>
            <p className="text-sm text-slate-500">© 2025 EmpowerAI. Built with ❤️ for South African youth.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
