// frontend/src/types/profile.types.ts

export interface TwinProfile {
  name?: string;
  careerStage?: string;
  province?: string;
  industry?: string;
  education?: string;
  skills?: string[];
  challenges?: string;
  goals?: string;
  empowermentScore?: number;
  experience?: string[];
  achievements?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CVAnalysisData {
  score: number;
  readinessLevel: string;
  sections: {
    skills: string[];
    experience: string[];
    education: string[];
    achievements: string[];
    about: string;
  };
  recommendations: string[];
  missingKeywords: string[];
  linkCheck: {
    linkedin: boolean;
    github: boolean;
    portfolio: boolean;
  };
  incomeIdeas?: Array<{
    title: string;
    difficulty: string;
    potential: string;
    description: string;
  }>;
}

export interface MarketInsight {
  title: string;
  matchScore: number;
  reason: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  demandLevel: 'High' | 'Medium' | 'Low';
  growthRate: number;
  locations: string[];
}

export interface SkillGap {
  skill: string;
  importance: 'critical' | 'recommended' | 'optional';
  resources: Array<{
    title: string;
    type: 'course' | 'certification' | 'workshop';
    provider: string;
    duration: string;
    cost: string;
    url?: string;
  }>;
}

export interface ActionPlanItem {
  task: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  reason: string;
}

export interface ShortTermGoal {
  task: string;
  targetDate: string;
  expectedOutcome: string;
}

export interface LongTermGoal {
  goal: string;
  milestones: string[];
  projectedTimeline: string;
}

export interface ActionPlan {
  immediate: ActionPlanItem[];
  shortTerm: ShortTermGoal[];
  longTerm: LongTermGoal[];
}

export interface CareerPath {
  title: string;
  description: string;
  matchPercentage: number;
  steps: string[];
  potentialIncome: number;
}

export interface GrowingIndustry {
  name: string;
  growth: number;
  relevantRoles: string[];
}

export interface SalaryBenchmark {
  entry: number;
  mid: number;
  senior: number;
  byLocation: Record<string, { entry: number; mid: number; senior: number }>;
}

export interface MarketInsights {
  topOpportunities: MarketInsight[];
  inDemandSkills: string[];
  growingIndustries: GrowingIndustry[];
  salaryBenchmarks: SalaryBenchmark;
}

export interface EnrichedProfile extends TwinProfile {
  cvData?: {
    skills: string[];
    experience: string[];
    education: string[];
    achievements: string[];
    recommendations: string[];
    score: number;
    readinessLevel: string;
    analysisDate: string;
  };
  marketInsights: MarketInsights;
  skillGaps: SkillGap[];
  actionPlan: ActionPlan;
  recommendedPaths: CareerPath[];
}