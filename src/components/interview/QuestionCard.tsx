// frontend/src/components/interview/QuestionCard.tsx
import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    type: string;
    difficulty: string;
  };
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string) => void;
  isSubmitting?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  isSubmitting = false
}) => {
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isTimerActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'medium': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'hard': return 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().length < 20) {
      alert('Please provide a more detailed answer (at least 20 characters)');
      return;
    }
    onSubmit(answer);
    setIsTimerActive(false);
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <span className="text-sm font-medium opacity-90">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase",
            getDifficultyColor(question.difficulty)
          )}>
            {question.difficulty}
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-bold leading-relaxed">
          {question.text}
        </h3>
      </div>

      {/* Timer */}
      <div className="border-b border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Time Remaining:</span>
          </div>
          <span className={cn(
            "font-mono font-bold",
            timeRemaining < 30 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
          )}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Your Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... (Use STAR method: Situation, Task, Action, Result)"
            className="w-full h-40 md:h-48 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Word Count */}
        <div className="flex justify-between items-center text-sm">
          <span className={cn(
            "text-slate-500 dark:text-slate-400",
            wordCount < 30 && 'text-amber-600 dark:text-amber-400'
          )}>
            {wordCount} words
            {wordCount < 30 && ' (aim for 50-100 words)'}
          </span>
          {wordCount < 20 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
              <AlertCircle className="h-3 w-3" />
              Too short
            </span>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-2">💡 Tips</h4>
          <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
            <li>• Use specific examples from your experience</li>
            <li>• Structure with STAR method</li>
            <li>• Quantify results when possible</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || answer.trim().length < 20}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
            isSubmitting || answer.trim().length < 20
              ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Answer...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Answer
            </>
          )}
        </button>
      </form>
    </div>
  );
};