// frontend/src/components/interview/FeedbackCard.tsx
import React from 'react';
import { CheckCircle, Lightbulb, TrendingUp, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FeedbackCardProps {
  feedback: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    suggestedAnswer?: string;
  };
  question: string;
  answer: string;
}

// Star component
const Star = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  question,
  answer
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20';
    if (score >= 40) return 'bg-amber-50 dark:bg-amber-900/20';
    return 'bg-rose-50 dark:bg-rose-900/20';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Question Recap */}
      <div className="bg-slate-50 dark:bg-slate-700/50 p-4 md:p-6 border-b border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Question:</p>
        <p className="text-sm md:text-base font-medium text-slate-800 dark:text-white">{question}</p>
      </div>

      {/* Your Answer */}
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Your Answer:</p>
        <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-3 md:p-4 rounded-xl">
          {answer}
        </p>
      </div>

      {/* Score */}
      <div className={cn(
        "p-6 md:p-8 text-center border-b border-slate-100 dark:border-slate-700",
        getScoreBg(feedback.score)
      )}>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Score</p>
        <div className="flex items-center justify-center gap-2">
          <span className={cn("text-4xl md:text-5xl font-black", getScoreColor(feedback.score))}>
            {feedback.score}
          </span>
          <span className="text-xl md:text-2xl text-slate-400">/100</span>
        </div>
        <div className="mt-4 flex justify-center">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4 md:h-5 md:w-5",
                  star <= Math.round(feedback.score / 20)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-300 dark:text-slate-600'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div>
          <h4 className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 md:mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            Feedback
          </h4>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {feedback.feedback}
          </p>
        </div>

        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2 md:mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Strengths
            </h4>
            <ul className="space-y-1 md:space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {feedback.improvements && feedback.improvements.length > 0 && (
          <div>
            <h4 className="text-xs md:text-sm font-bold text-amber-700 dark:text-amber-400 mb-2 md:mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Areas to Improve
            </h4>
            <ul className="space-y-1 md:space-y-2">
              {feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Answer */}
        {feedback.suggestedAnswer && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h4 className="text-xs md:text-sm font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Model Answer
            </h4>
            <p className="text-xs md:text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
              {feedback.suggestedAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};