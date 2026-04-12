import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Lock, FileText, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureLockedProps {
  featureName: string;
  featureDescription: string;
  requiredStep: 'cv' | 'twin';
  onClose?: () => void;
}

const stepInfo = {
  cv: {
    title: 'Complete CV Analysis First',
    description: 'Your CV is the foundation of everything. We need to analyze it to unlock personalized features.',
    icon: FileText,
    linkPath: '/dashboard/cv-analyzer',
    linkText: 'Analyze Your CV',
    estimatedTime: '5-10 minutes',
  },
  twin: {
    title: 'Build Your Digital Twin First',
    description: 'Your Digital Twin uses AI to understand your career potential on the SA market. Once created, all features unlock!',
    icon: Brain,
    linkPath: '/dashboard/twin',
    linkText: 'Build Twin Now',
    estimatedTime: '3-5 minutes',
  },
};

/**
 * FeatureLockedModal Component
 * Displays when user tries to access a feature they haven't unlocked yet
 * Provides clear explanation and direct link to prerequisite
 */
export default function FeatureLocked({
  featureName,
  featureDescription,
  requiredStep,
  onClose,
}: FeatureLockedProps) {
  const info = stepInfo[requiredStep];
  const Icon = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl max-w-md w-full border border-border/40 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-8 border-b border-border/40">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">Feature Locked</h2>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>{featureName}</strong> is not yet available
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Current feature description */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">You tried to access: </span>
              <br />
              <strong>{featureDescription}</strong>
            </p>
          </div>

          {/* Prerequisites */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">{info.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
              </div>
            </div>

            {/* Time estimate */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/20 rounded-lg">
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              Estimated time: <strong>{info.estimatedTime}</strong>
            </div>
          </div>

          {/* Why this matters */}
          <div className="p-3 bg-blue-50/30 border border-blue-200/30 rounded-lg">
            <p className="text-xs text-blue-900 leading-relaxed">
              💡 This step is essential because we need to understand your skills, experience, and goals to provide personalized guidance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/20 border-t border-border/40 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted rounded-lg transition-colors"
          >
            Maybe Later
          </button>
          <Link
            to={info.linkPath}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {info.linkText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
