import { Users, Target, Heart, Award, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-background dark:via-background dark:to-muted/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            About EmpowerAI
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            Empowering South African Youth Through Technology
          </p>
        </div>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Our Mission</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                EmpowerAI exists to bridge the gap between South African youth and economic opportunity. We believe every
                young person deserves a clear path to financial independence, regardless of their background or
                circumstances. Our platform uses AI to provide personalized career guidance, real opportunities, and
                practical tools to build their future.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">The Challenge</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                South Africa faces a youth unemployment crisis. Young people struggle with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-2">
                <li>Limited access to career guidance and mentorship</li>
                <li>Difficulty finding relevant opportunities</li>
                <li>Lack of visibility into future earning potential</li>
                <li>CVs that do not stand out to employers</li>
                <li>Interview anxiety and lack of preparation</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Award className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">How We Help</h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Digital Economic Twin</h3>
                  <p>Create your personalized AI avatar to simulate career paths and potential income growth.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Real Job Opportunities</h3>
                  <p>Access verified learnerships, internships, bursaries, and entry-level jobs.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">AI CV Analyzer</h3>
                  <p>Get instant CV feedback with practical suggestions aligned to market requirements.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Interview Coach</h3>
                  <p>Practice interviews and improve confidence with guided feedback.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Our Values</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Transparency</h3>
                  <p>We are open about how our AI works and where opportunities come from.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Accessibility</h3>
                  <p>Free to use, mobile-friendly, and built for all South African youth.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Real Impact</h3>
                  <p>We measure success by meaningful outcomes, not vanity metrics.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Privacy</h3>
                  <p>Your data is protected and handled with care.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 sm:p-8 text-primary-foreground">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Get in Touch</h2>
          <p className="mb-5 sm:mb-6 opacity-90 text-sm sm:text-base">
            Have questions or want to partner with us? We would love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="mailto:support@empowerai.co.za"
              className="flex items-center justify-center sm:justify-start gap-2 bg-background text-primary px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-background/90 transition-colors"
            >
              <Mail className="h-5 w-5" />
              support@empowerai.co.za
            </a>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-primary-foreground/90">
              <MapPin className="h-5 w-5" />
              <span>South Africa</span>
            </div>
          </div>
        </section>

        <div className="text-center mt-6 sm:mt-8">
          <Link to="/" className="text-primary hover:underline font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
