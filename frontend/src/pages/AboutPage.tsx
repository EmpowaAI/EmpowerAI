import { Users, Target, Heart, Award, Mail, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About EmpowerAI
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Empowering South African Youth Through Technology
          </p>
        </div>

        {/* Mission */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <Target className="h-8 w-8 text-primary dark:text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Our Mission
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                EmpowerAI exists to bridge the gap between South African youth and economic opportunity. 
                We believe every young person deserves a clear path to financial independence, regardless 
                of their background or circumstances. Our platform uses AI technology to provide personalized 
                career guidance, real job opportunities, and practical tools to help youth build their future.
              </p>
            </div>
          </div>
        </section>

        {/* Problem We Solve */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <Users className="h-8 w-8 text-primary dark:text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                The Challenge
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                South Africa faces a youth unemployment crisis. Young people struggle with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                <li>Limited access to career guidance and mentorship</li>
                <li>Difficulty finding relevant opportunities (learnerships, internships, jobs)</li>
                <li>Lack of visibility into future earning potential</li>
                <li>CVs that don't stand out to employers</li>
                <li>Interview anxiety and lack of preparation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Solution */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <Award className="h-8 w-8 text-primary dark:text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                How We Help
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    🔮 Digital Economic Twin
                  </h3>
                  <p>
                    Create your personalized AI avatar that simulates different career paths and shows 
                    your potential income growth over time.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    📊 Real Job Opportunities
                  </h3>
                  <p>
                    Access real, verified opportunities from South African companies - learnerships, 
                    internships, bursaries, and entry-level jobs.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    📝 AI CV Analyzer
                  </h3>
                  <p>
                    Get instant feedback on your CV with AI-powered analysis and improvement suggestions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    🎤 Interview Coach
                  </h3>
                  <p>
                    Practice interviews with our AI coach and get personalized feedback to boost your confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <Heart className="h-8 w-8 text-primary dark:text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Our Values
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-300">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Transparency</h3>
                  <p>We're open about how our AI works and where opportunities come from.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Accessibility</h3>
                  <p>Free to use, works on mobile phones, designed for all South African youth.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Real Impact</h3>
                  <p>We measure success by actual job placements, not just user numbers.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Privacy</h3>
                  <p>Your data is protected. We comply with POPI Act and respect your privacy.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-6 opacity-90">
            Have questions? Want to partner with us? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="mailto:support@empowerai.co.za" 
              className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors"
            >
              <Mail className="h-5 w-5" />
              support@empowerai.co.za
            </a>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-5 w-5" />
              <span>South Africa</span>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-primary dark:text-primary hover:underline font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

