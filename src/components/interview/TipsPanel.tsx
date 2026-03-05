// frontend/src/components/interview/TipsPanel.tsx
import React, { useState } from 'react';
import {  ChevronDown, ChevronUp, BookOpen, Mic, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TipsPanelProps {
  interviewType: string;
}

export const TipsPanel: React.FC<TipsPanelProps> = ({ interviewType }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const tips = {
    tech: {
      title: 'Technical Interview Tips',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'blue',
      items: [
        'Explain your thought process out loud',
        'Start with a high-level approach, then dive into details',
        'Discuss trade-offs and alternative solutions',
        'Mention specific technologies and versions you\'ve used',
        'Use the STAR method for behavioral parts',
        'Ask clarifying questions before diving in'
      ]
    },
    behavioral: {
      title: 'Behavioral Interview Tips',
      icon: <Mic className="h-5 w-5" />,
      color: 'emerald',
      items: [
        'Always use the STAR method (Situation, Task, Action, Result)',
        'Be specific with examples from your experience',
        'Quantify results whenever possible',
        'Show self-awareness and growth',
        'Keep answers to 2-3 minutes',
        'Practice with the STAR framework'
      ]
    },
    'non-tech': {
      title: 'General Interview Tips',
      icon: <Award className="h-5 w-5" />,
      color: 'purple',
      items: [
        'Research the company beforehand',
        'Prepare questions for the interviewer',
        'Use specific examples from your experience',
        'Show enthusiasm and positive attitude',
        'Be honest about your experience',
        'Follow up with a thank you note'
      ]
    }
  };

  const currentTips = tips[interviewType as keyof typeof tips] || tips.behavioral;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className={cn(
            "p-1.5 md:p-2 rounded-lg",
            currentTips.color === 'blue' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
            currentTips.color === 'emerald' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
            currentTips.color === 'purple' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400'
          )}>
            {currentTips.icon}
          </div>
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white">{currentTips.title}</h3>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-slate-500" /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-slate-500" />}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
          <ul className="space-y-2 md:space-y-3">
            {currentTips.items.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm">
                <span className={cn(
                  "w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-bold flex-shrink-0 mt-0.5",
                  currentTips.color === 'blue' && 'bg-blue-500',
                  currentTips.color === 'emerald' && 'bg-emerald-500',
                  currentTips.color === 'purple' && 'bg-purple-500'
                )}>
                  {index + 1}
                </span>
                <span className="text-slate-600 dark:text-slate-400">{tip}</span>
              </li>
            ))}
          </ul>

          {/* Practice Area */}
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Quick Practice</h4>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Try answering a question using the STAR method:
            </p>
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">S</span>ituation: Describe the context<br />
                <span className="font-bold text-slate-700 dark:text-slate-300">T</span>ask: What was required?<br />
                <span className="font-bold text-slate-700 dark:text-slate-300">A</span>ction: What did you do?<br />
                <span className="font-bold text-slate-700 dark:text-slate-300">R</span>esult: What was the outcome?
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};