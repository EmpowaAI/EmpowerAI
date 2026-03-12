import { useState } from 'react'
import { Brain, Sparkles, Mic, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import { useUser } from "../contexts/user-context"
import HolographicButton from "../components/ui/HolographicButton"
import NeuralCard from "../components/ui/NeuralCard"
import AIAvatar from "../components/ui/AIAvatar"
import VoiceVisualizer from "../components/ui/VoiceVisualizer"
import NeuralLoading from "../components/ui/NeuralLoading"
import CVAnalyzer8D from "./CV-analysis/CVAnalyzer8D"
import VoiceInterviewCoach from "./Interview/VoiceInterviewCoach"

export default function NeuralFusionShowcase() {
  const [activeFeature, setActiveFeature] = useState<'cv-analyzer' | 'voice-coach' | null>(null)

  if (activeFeature === 'cv-analyzer') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <HolographicButton onClick={() => setActiveFeature(null)} className="mb-6">
            ← Back to Showcase
          </HolographicButton>
        </div>
        <CVAnalyzer8D />
      </div>
    )
  }

  if (activeFeature === 'voice-coach') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <HolographicButton onClick={() => setActiveFeature(null)} className="mb-6">
            ← Back to Showcase
          </HolographicButton>
        </div>
        <VoiceInterviewCoach />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <NeuralCard className="text-center">
          <div className="flex items-center justify-center gap-6 mb-6">
            <AIAvatar size="xl" variant="default" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                Neural Fusion
              </h1>
              <p className="text-xl text-muted-foreground">
                AI-Powered Career Transformation Platform
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">AI-First Design</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">8D Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-accent" />
              <span className="text-sm text-muted-foreground">Voice Intelligence</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of career development with cutting-edge AI technology 
            designed specifically for South African youth.
          </p>
        </NeuralCard>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 8D CV Analyzer */}
          <NeuralCard className="group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">8D CV Analyzer</h3>
                  <p className="text-muted-foreground">Revolutionary AI-powered analysis</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-sm text-muted-foreground">Content Quality Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-muted-foreground">ATS Compatibility Check</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span className="text-sm text-muted-foreground">SA Market Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-sm text-muted-foreground">Salary Projections</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm text-accent">85% Average Improvement</span>
              </div>
              <HolographicButton onClick={() => setActiveFeature('cv-analyzer')}>
                Try Now <ArrowRight className="h-4 w-4" />
              </HolographicButton>
            </div>
          </NeuralCard>

          {/* Voice Interview Coach */}
          <NeuralCard className="group hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Mic className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Voice Interview Coach</h3>
                  <p className="text-muted-foreground">Real-time AI feedback</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-sm text-muted-foreground">Speech Recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm text-muted-foreground">Confidence Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span className="text-sm text-muted-foreground">Real-time Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-sm text-muted-foreground">Emotion Detection</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VoiceVisualizer isActive={true} intensity={0.6} />
                <span className="text-sm text-accent">80% Readiness Rate</span>
              </div>
              <HolographicButton onClick={() => setActiveFeature('voice-coach')}>
                Start Practice <ArrowRight className="h-4 w-4" />
              </HolographicButton>
            </div>
          </NeuralCard>
        </div>

        {/* Component Showcase */}
        <NeuralCard>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Neural Fusion Components</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Holographic Buttons */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Holographic Buttons</h4>
              <div className="space-y-2">
                <HolographicButton variant="primary" className="w-full">
                  Primary Action
                </HolographicButton>
                <HolographicButton variant="secondary" className="w-full">
                  Secondary Action
                </HolographicButton>
                <HolographicButton variant="accent" className="w-full">
                  Accent Action
                </HolographicButton>
              </div>
            </div>

            {/* AI Avatars */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">AI Avatars</h4>
              <div className="flex items-center justify-center gap-4">
                <AIAvatar size="sm" variant="default" />
                <AIAvatar size="md" variant="thinking" />
                <AIAvatar size="lg" variant="speaking" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Dynamic states: Default, Thinking, Speaking
              </div>
            </div>

            {/* Neural Loading */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Neural Loading</h4>
              <div className="space-y-2">
                <NeuralLoading size="sm" text="Processing..." />
                <NeuralLoading size="md" text="Analyzing data..." />
                <NeuralLoading size="lg" text="AI thinking..." />
              </div>
            </div>
          </div>
        </NeuralCard>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NeuralCard className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">8</div>
            <p className="text-muted-foreground">Dimensions of CV Analysis</p>
          </NeuralCard>
          <NeuralCard className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">24/7</div>
            <p className="text-muted-foreground">AI Mentor Availability</p>
          </NeuralCard>
          <NeuralCard className="text-center">
            <div className="text-4xl font-bold text-secondary mb-2">100%</div>
            <p className="text-muted-foreground">SA Market Context</p>
          </NeuralCard>
        </div>

        {/* Call to Action */}
        <NeuralCard className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Career?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of South African youth using AI to accelerate their careers
          </p>
          <div className="flex justify-center gap-4">
            <HolographicButton variant="primary" size="lg">
              Get Started Free
            </HolographicButton>
            <HolographicButton variant="secondary" size="lg">
              View Features
            </HolographicButton>
          </div>
        </NeuralCard>
      </div>
    </div>
  )
}
