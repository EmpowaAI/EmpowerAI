import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Mic, Award } from 'lucide-react';
interface TipsPanelProps {
  interviewType: string;
}
export const TipsPanel: React.FC<TipsPanelProps> = ({ interviewType }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const tips: Record<string, { title: string; icon: React.ReactNode; items: string[] }> = {
    tech: {
      title: 'Technical Interview Tips',
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        'Explain your thought process out loud',
        'Start with a high-level approach, then dive into details',
        'Discuss trade-offs and alternative solutions',
        "Mention specific technologies and versions you've used",
        'Use the STAR method for behavioral parts',
        'Ask clarifying questions before diving in'
      ]
    },
    behavioral: {
      title: 'Behavioral Interview Tips',
      icon: <Mic className="h-5 w-5" />,
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
  const currentTips = tips[interviewType] || tips.behavioral;
  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-sa-gold/10 hover:bg-sa-gold/15 transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-lg bg-sa-gold/20 text-sa-gold">
            {currentTips.icon}
          </div>
          <h3 className="text-sm md:text-base font-bold text-foreground">{currentTips.title}</h3>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isExpanded && (
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
          <ul className="space-y-2 md:space-y-3">
            {currentTips.items.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm">
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-primary-foreground text-[10px] md:text-xs font-bold flex-shrink-0 mt-0.5 bg-sa-gold">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
            <h4 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase mb-2">Quick Practice</h4>
            <p className="text-xs md:text-sm text-muted-foreground">Try answering a question using the STAR method:</p>
            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-[10px] md:text-xs text-muted-foreground">
                <span className="font-bold text-foreground">S</span>ituation: Describe the context<br />
                <span className="font-bold text-foreground">T</span>ask: What was required?<br />
                <span className="font-bold text-foreground">A</span>ction: What did you do?<br />
                <span className="font-bold text-foreground">R</span>esult: What was the outcome?
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};