import { AlertTriangle, Zap, Lightbulb, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CVUploadErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRateLimited?: boolean;
  retryAfter?: number;
}

type ErrorCategory = 'file' | 'network' | 'processing' | 'rate-limit' | 'other';

/**
 * Categorizes error messages and provides actionable advice
 */
function categorizeError(error: string): {
  category: ErrorCategory;
  title: string;
  advice: string[];
  icon: string;
} {
  const lowerError = error.toLowerCase();

  if (lowerError.includes('file') || lowerError.includes('format') || lowerError.includes('pdf') || lowerError.includes('docx')) {
    return {
      category: 'file',
      title: 'File Format Error',
      advice: [
        'Upload a PDF, DOC, or DOCX file',
        'Maximum file size is 10MB',
        'Ensure the file is not password protected',
        'Try re-saving your CV and uploading again',
      ],
      icon: '📄',
    };
  }

  if (lowerError.includes('network') || lowerError.includes('timeout') || lowerError.includes('connection')) {
    return {
      category: 'network',
      title: 'Network Connection Issue',
      advice: [
        'Check your internet connection',
        'Try disabling VPN if using one',
        'Wait a moment and try again',
        'Try refreshing the page',
      ],
      icon: '🌐',
    };
  }

  if (lowerError.includes('rate limit') || lowerError.includes('too many')) {
    return {
      category: 'rate-limit',
      title: 'Too Many Requests',
      advice: [
        'You\'ve made too many requests recently',
        'Please wait a few minutes before trying again',
        'The system will reset shortly',
      ],
      icon: '⏱️',
    };
  }

  if (lowerError.includes('processing') || lowerError.includes('analysis') || lowerError.includes('parse')) {
    return {
      category: 'processing',
      title: 'Analysis Processing Error',
      advice: [
        'Your CV might contain unusual formatting',
        'Try uploading a simpler, cleaner version',
        'Ensure all text is readable (no scanned images)',
        'Check that CV has no corrupted sections',
      ],
      icon: '⚙️',
    };
  }

  return {
    category: 'other',
    title: 'Analysis Failed',
    advice: [
      'Try uploading your CV again',
      'Ensure your CV is clear and complete',
      'If the problem persists, contact support',
    ],
    icon: '❌',
  };
}

/**
 * CVUploadError Component
 * Displays detailed, actionable error messages for CV upload failures
 */
export default function CVUploadError({
  error,
  onRetry,
  onDismiss,
  isRateLimited = false,
  retryAfter,
}: CVUploadErrorProps) {
  const { category, title, advice, icon } = categorizeError(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4 rounded-lg border-l-4 border-destructive bg-destructive/5 overflow-hidden shadow-sm"
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {error}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2 p-1"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actionable advice */}
        <div className="bg-white/40 dark:bg-slate-900/40 rounded-md p-3 mb-4 border border-border/40">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />
            Try these steps:
          </p>
          <ul className="space-y-1.5">
            {advice.map((tip, idx) => (
              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary/60 font-semibold flex-shrink-0">{idx + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rate limit notice */}
        {isRateLimited && retryAfter && (
          <div className="bg-blue-50/40 dark:bg-blue-900/20 rounded-md p-3 mb-4 border border-blue-200/30 dark:border-blue-800/30 flex items-start gap-2">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-blue-900 dark:text-blue-200">Rate limited</p>
              <p className="text-blue-800 dark:text-blue-300 mt-1">
                Please wait <strong>{retryAfter} seconds</strong> before trying again to avoid overloading our servers.
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRateLimited}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
          >
            Dismiss
          </button>
        </div>

        {/* Support info */}
        <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
          Still having trouble?{' '}
          <a href="mailto:support@empowerai.io" className="text-primary hover:underline font-medium">
            Contact our support team
          </a>
        </div>
      </div>
    </motion.div>
  );
}
