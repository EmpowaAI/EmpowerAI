import { motion } from 'framer-motion';
import { FileText, Brain, Sparkles, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Step 1: Upload CV',
    description: 'Start by uploading your CV. Our AI will analyze it in seconds using advanced NLP.',
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: 'Step 2: Create Twin',
    description: 'Build your Digital Economic Twin - your AI-powered career advisor matched to the SA market.',
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: 'Step 3: Explore Features',
    description: 'Interview practice, job opportunities, career simulations, and 24/7 AI mentorship await!',
  },
];

export default function FirstTimeUserOnboarding() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8 p-6 bg-gradient-to-br from-primary/10 via-blue-50/50 to-emerald-50/50 rounded-2xl border border-primary/20"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Welcome to EmpowerAI! 🚀</h2>
          <p className="text-sm text-muted-foreground">
            Let's get you started. Here's your journey to career empowerment:
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors ml-2"
        >
          ✕
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Connection line to next step (on desktop) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 -right-8 w-8 h-0.5 bg-primary/30" />
            )}

            <div className="flex flex-col items-center text-center">
              {/* Step number badge */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                <div className="relative bg-primary/10 border border-primary/30 rounded-full p-4 text-primary">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick tip */}
      <div className="mt-6 p-3 bg-blue-50/50 border border-blue-200/30 rounded-lg flex gap-3">
        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          💡 <strong>Pro Tip:</strong> Your CV is the foundation of everything. The more complete and detailed, the better our AI can help you!
        </p>
      </div>
    </motion.div>
  );
}
