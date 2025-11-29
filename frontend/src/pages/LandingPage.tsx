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
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">EmpowerAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </a>
          </div>
          <div className="flex items-center gap-4">
            
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Career Guidance
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
                Your Digital
                <span className="text-primary"> Economic</span>
                <br />
                Twin Awaits
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl mb-8">
                Visualize your future earning potential. Get personalized career pathways designed for South African
                youth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#demo"
                  className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Watch Demo
                </a>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Asanda, 22</p>
                    <p className="text-sm text-muted-foreground">Soweto, Gauteng</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Empowerment Score</span>
                    <span className="text-secondary font-bold">78/100</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">3-Month Projection</p>
                      <p className="text-xl font-bold text-accent">R4,200/mo</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Best Path</p>
                      <p className="text-xl font-bold text-primary">Freelance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "63%", label: "Youth Unemployment in SA" },
              { value: "10K+", label: "Career Paths Analyzed" },
              { value: "95%", label: "Accuracy Rate" },
              { value: "24/7", label: "AI Support Available" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive tools for your economic empowerment journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-muted">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and see your future unfold.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Profile", desc: "Enter your skills, education, and interests" },
              { step: "02", title: "Build Your Twin", desc: "AI generates your economic digital twin" },
              { step: "03", title: "Run Simulations", desc: "Compare different career pathways" },
              { step: "04", title: "Take Action", desc: "Follow your personalized roadmap" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-primary/30 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Story */}
      <section id="demo" className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Meet Asanda from Soweto</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Asanda, 22, uploads her CV and enters her interests. EmpowerAI builds a digital version of her — her
                Economic Twin.
              </p>
              <p>
                The twin runs simulations for learnerships, freelancing, a Web Design course, and entry-level support
                roles.
              </p>
              <p className="text-foreground font-medium">
                It shows her the best path: Freelancing + learnership → R4,200/month by Month 3.
              </p>
              <p>In 20 seconds, she sees her future clearly.</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {["Income Projections", "Career Roadmap", "Interview Prep", "Local Opportunities"].map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-card border border-border rounded-full text-sm flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4 text-accent" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-muted">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to See Your Future?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of South African youth taking control of their economic destiny.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start Your Journey <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-card">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">EmpowerAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Melsoft Academy Hackathon 2025 | Team: Nicolette, Lunga, Eva, Siyanda, Lindy
          </p>
        </div>
      </footer>
    </div>
  )
}
