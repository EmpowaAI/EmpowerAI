
export const ReadinessLevel = {
  ENTRY: 'ENTRY',
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  EXPERT: 'EXPERT'
} as const;

export type ReadinessLevel = typeof ReadinessLevel[keyof typeof ReadinessLevel];

export interface IncomeIdea {
  title: string;
  difficulty: 'Low' | 'Medium' | 'High';
  potential: 'Low' | 'Medium' | 'High' | 'Very High';
  description: string;
}

export interface CVAnalysis {
  score: number;
  readinessLevel: ReadinessLevel;
  summary: string;
  sections: {
    about: string;
    skills: string[];
    education: string[];
    experience: string[];
    achievements: string[];
  };
  linkCheck: {
    linkedin: boolean;
    github: boolean;
    portfolio: boolean;
  };
  recommendations: string[];
  missingKeywords: string[];
  incomeIdeas: IncomeIdea[];
}
