// frontend/src/types/interview.ts

export interface InterviewQuestion {
  id: string;
  text: string;
  type: 'tech' | 'behavioral' | 'non-tech';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer?: string;
}

export interface InterviewSession {
  sessionId: string;
  type: string;
  difficulty: string;
  company?: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  feedback: Array<{
    questionId: string;
    response: string;
    feedback: InterviewFeedback;
  }>;
  startedAt?: string;
  cvUsed?: boolean;
}

export interface InterviewAnswer {
  questionId: string;
  response: string;
}

export interface InterviewStartRequest {
  type: string;
  difficulty: string;
  company?: string;
}