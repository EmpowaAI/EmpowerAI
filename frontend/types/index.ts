// User Types
export interface User {
  id: string;
  name: string;
  age: number;
  province: string;
  skills: string[];
  education: string;
  email: string;
  createdAt: string;
}

// Digital Twin Types
export interface EconomicTwin {
  id: string;
  userId: string;
  skillVector: number[];
  incomeProjection: IncomeProjection;
  empowermentScore: number;
  growthModel: GrowthModel;
  createdAt: string;
}

export interface IncomeProjection {
  threeMonth: number;
  sixMonth: number;
  twelveMonth: number;
}

export interface GrowthModel {
  skillGrowth: number[];
  employabilityIndex: number;
  recommendedPaths: string[];
}

// Simulation Types
export interface PathSimulation {
  pathId: string;
  pathName: string;
  description: string;
  projections: {
    threeMonth: SimulationResult;
    sixMonth: SimulationResult;
    twelveMonth: SimulationResult;
  };
}

export interface SimulationResult {
  income: number;
  skillGrowth: number;
  employabilityIndex: number;
  milestones: string[];
}

// CV Analysis Types
export interface CVAnalysis {
  extractedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  improvedVersion?: string;
}

// Job Fit Types
export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  province: string;
  type: 'job' | 'learnership' | 'internship' | 'bursary' | 'course';
  salary?: number;
  requirements: string[];
  matchScore: number;
  description: string;
}

// Interview Coach Types
export interface InterviewSession {
  id: string;
  type: 'tech' | 'non-tech' | 'behavioral';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  feedback: InterviewFeedback[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewFeedback {
  questionId: string;
  response: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

