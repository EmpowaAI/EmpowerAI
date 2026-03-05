// frontend/src/hooks/useInterview.ts
import { useState, useCallback, useEffect } from 'react';
import { 
  interviewService, 
  type CVContext, 
  type ServiceInterviewSession, 
  type ServiceInterviewFeedback 
} from '../services/interviewService';

interface UseInterviewReturn {
  session: ServiceInterviewSession | null;
  currentQuestion: ServiceInterviewSession['questions'][0] | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
  answers: Map<string, string>;
  feedbacks: Map<string, ServiceInterviewFeedback>;
  isLoading: boolean;
  error: string | null;
  sessionComplete: boolean;
  apiAvailable: boolean;
  startInterview: (
    type: string,
    difficulty: string,
    company?: string,
    cvData?: CVContext,
    jobDescription?: string
  ) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  goToQuestion: (index: number) => void;
  resetInterview: () => void;
}

export function useInterview(): UseInterviewReturn {
  const [session, setSession] = useState<ServiceInterviewSession | null>(null);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [feedbacks, setFeedbacks] = useState<Map<string, ServiceInterviewFeedback>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);

  const currentQuestionIndex = session?.currentQuestionIndex ?? 0;
  const totalQuestions = session?.questions.length ?? 0;
  const currentQuestion = session?.questions[currentQuestionIndex] ?? null;
  const sessionComplete = session ? currentQuestionIndex >= totalQuestions : false;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

  // Test API connection on mount
  useEffect(() => {
    interviewService.testConnection().then(setApiAvailable).catch(() => setApiAvailable(false));
  }, []);

  const startInterview = useCallback(async (
    type: string,
    difficulty: string,
    company?: string,
    cvData?: CVContext,
    jobDescription?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await interviewService.startInterview(
        type,
        difficulty,
        company,
        cvData,
        jobDescription
      );
      setSession(newSession);
      setAnswers(new Map());
      setFeedbacks(new Map());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      console.error('Error starting interview:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const feedback = await interviewService.submitAnswer(
        session.sessionId,
        questionId,
        answer,
        undefined // cvData - could be passed if needed
      );
      
      setAnswers(prev => new Map(prev).set(questionId, answer));
      setFeedbacks(prev => new Map(prev).set(questionId, feedback));
      
      // Move to next question if not last
      if (currentQuestionIndex < totalQuestions - 1) {
        setSession(prev => prev ? {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      console.error('Error submitting answer:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session, currentQuestionIndex, totalQuestions]);

  const goToQuestion = useCallback((index: number) => {
    if (session && index >= 0 && index < totalQuestions) {
      setSession({
        ...session,
        currentQuestionIndex: index
      });
    }
  }, [session, totalQuestions]);

  const resetInterview = useCallback(() => {
    setSession(null);
    setAnswers(new Map());
    setFeedbacks(new Map());
    setError(null);
  }, []);

  return {
    session,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    progress,
    answers,
    feedbacks,
    isLoading,
    error,
    sessionComplete,
    apiAvailable,
    startInterview,
    submitAnswer,
    goToQuestion,
    resetInterview
  };
}