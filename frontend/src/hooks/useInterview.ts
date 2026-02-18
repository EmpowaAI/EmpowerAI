import { useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '../lib/user-context';
import { interviewService } from '../services/interviewService';
import type { 
  InterviewSession, 
  InterviewFeedback, 
  InterviewQuestion 
} from '../types/interview';
import type { 
  ServiceInterviewSession,
  ServiceInterviewFeedback 
} from '../services/interviewService';

export const useInterview = () => {
  const { cvData } = useUser();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [feedbacks, setFeedbacks] = useState<Map<string, InterviewFeedback>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const connectionChecked = useRef(false);

  // Silent connection check – no error state, no console logs
  useEffect(() => {
    if (connectionChecked.current) return;
    connectionChecked.current = true;
    
    const checkConnection = async () => {
      try {
        const available = await interviewService.testConnection();
        setApiAvailable(available);
        setUseFallback(!available);
      } catch {
        // Silently fall back to local mode
        setApiAvailable(false);
        setUseFallback(true);
      }
    };
    
    checkConnection();
  }, []);

  const convertToAppSession = (serviceSession: ServiceInterviewSession): InterviewSession => ({
    sessionId: serviceSession.sessionId,
    type: serviceSession.type,
    difficulty: serviceSession.difficulty,
    company: serviceSession.company,
    currentQuestionIndex: serviceSession.currentQuestionIndex,
    feedback: serviceSession.feedback,
    startedAt: serviceSession.startedAt,
    cvUsed: serviceSession.cvUsed,
    questions: serviceSession.questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type as 'tech' | 'behavioral' | 'non-tech',
      difficulty: q.difficulty as 'easy' | 'medium' | 'hard'
    }))
  });

  const convertToAppFeedback = (serviceFeedback: ServiceInterviewFeedback): InterviewFeedback => ({
    score: serviceFeedback.score,
    feedback: serviceFeedback.feedback,
    strengths: serviceFeedback.strengths,
    improvements: serviceFeedback.improvements,
    suggestedAnswer: serviceFeedback.suggestedAnswer
  });

  const startInterview = useCallback(async (
    type: string,
    difficulty: string = "medium",
    company?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setSessionComplete(false);
    
    try {
      // Try API if available
      if (apiAvailable && !useFallback) {
        try {
          const serviceSession = await interviewService.startInterview(
            type, 
            difficulty, 
            company,
            cvData
          );
          const appSession = convertToAppSession(serviceSession);
          setSession(appSession);
          setCurrentQuestionIndex(0);
          setAnswers(new Map());
          setFeedbacks(new Map());
          setIsLoading(false);
          return appSession;
        } catch {
          // API failed – silently switch to fallback
          setUseFallback(true);
        }
      }
      
      // Generate fallback questions (personalized with CV if available)
      let questions: InterviewQuestion[] = [];
      const difficultyTyped = difficulty as 'easy' | 'medium' | 'hard';
      const typeTyped = type as 'tech' | 'behavioral' | 'non-tech';
      
      if (type === 'tech' && cvData?.sections?.skills) {
        const skills = cvData.sections.skills.slice(0, 3).join(', ');
        questions = [
          {
            id: `q1_${Date.now()}`,
            text: `Based on your experience with ${skills}, tell me about a project you've built.`,
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q2_${Date.now()}`,
            text: `How do you use ${cvData.sections.skills[0] || 'technology'} in your work?`,
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q3_${Date.now()}`,
            text: "Describe a challenging problem you solved recently.",
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q4_${Date.now()}`,
            text: "How do you stay updated with new technologies?",
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q5_${Date.now()}`,
            text: "What's your approach to learning new skills?",
            type: typeTyped,
            difficulty: difficultyTyped
          }
        ];
      } else {
        questions = [
          {
            id: `q1_${Date.now()}`,
            text: "Tell me about yourself and your experience.",
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q2_${Date.now()}`,
            text: "What are your greatest strengths?",
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q3_${Date.now()}`,
            text: "Where do you see yourself in 5 years?",
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q4_${Date.now()}`,
            text: "Why are you interested in this position?",
            type: typeTyped,
            difficulty: difficultyTyped
          },
          {
            id: `q5_${Date.now()}`,
            text: "Do you have any questions for us?",
            type: typeTyped,
            difficulty: difficultyTyped
          }
        ];
      }
      
      const newSession: InterviewSession = {
        sessionId: `session_${Date.now()}`,
        type,
        difficulty,
        company,
        questions: questions.slice(0, 5),
        currentQuestionIndex: 0,
        feedback: [],
        cvUsed: !!cvData
      };
      
      setSession(newSession);
      setCurrentQuestionIndex(0);
      setAnswers(new Map());
      setFeedbacks(new Map());
      setIsLoading(false);
      
      return newSession;
      
    } catch (err: any) {
      setError('Failed to start interview. Please try again.');
      setIsLoading(false);
    }
  }, [cvData, apiAvailable, useFallback]);

  const submitAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let feedback: InterviewFeedback;
      
      if (apiAvailable && !useFallback) {
        try {
          const serviceFeedback = await interviewService.submitAnswer(
            session.sessionId, 
            questionId, 
            answer,
            cvData
          );
          feedback = convertToAppFeedback(serviceFeedback);
        } catch {
          // API failed – silently use local evaluation
          feedback = generateLocalFeedback(questionId, answer, cvData, session.questions);
        }
      } else {
        feedback = generateLocalFeedback(questionId, answer, cvData, session.questions);
      }
      
      setAnswers(prev => new Map(prev).set(questionId, answer));
      setFeedbacks(prev => new Map(prev).set(questionId, feedback));
      
      if (currentQuestionIndex === session.questions.length - 1) {
        setSessionComplete(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      
      setIsLoading(false);
      return feedback;
    } catch {
      setIsLoading(false);
    }
  }, [session, currentQuestionIndex, apiAvailable, useFallback, cvData]);

  // Local feedback generator (same as before)
  const generateLocalFeedback = (questionId: string, answer: string, cvData: any, questions: InterviewQuestion[]): InterviewFeedback => {
    const question = questions.find(q => q.id === questionId);
    
    const hasSituation = /situation|context|when i|at work|project where/i.test(answer);
    const hasTask = /task|goal|objective|needed to|had to/i.test(answer);
    const hasAction = /action|did|implemented|created|developed|built|designed/i.test(answer);
    const hasResult = /result|outcome|achieved|improved|increased|reduced|delivered/i.test(answer);
    const starCount = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length;
    
    const hasNumbers = /\d+%|\d+ percent|increased|decreased|reduced|improved|delivered|launched|built|created/i.test(answer);
    const hasExamples = /example|project|experience|role|position|company|team/i.test(answer);
    const wordCount = answer.split(/\s+/).length;
    
    let score = 0;
    
    if (wordCount >= 150) score += 25;
    else if (wordCount >= 100) score += 20;
    else if (wordCount >= 75) score += 15;
    else if (wordCount >= 50) score += 10;
    else if (wordCount >= 30) score += 5;
    
    score += starCount * 7.5;
    
    if (hasNumbers) score += 15;
    if (hasExamples) score += 10;
    
    if (answer.length > 100) score += 10;
    if (answer.includes('.')) {
      const sentences = answer.split('.').filter(s => s.trim().length > 0);
      if (sentences.length >= 3) score += 10;
    }
    
    score = Math.min(score, 100);
    
    const skills = cvData?.sections?.skills || [];
    const skillsText = skills.length > 0 ? skills.slice(0, 3).join(', ') : 'your skills';
    
    let feedback = '';
    let strengths: string[] = [];
    let improvements: string[] = [];
    let suggestedAnswer = '';
    
    if (score >= 90) {
      feedback = `Excellent answer! You've provided a comprehensive response with strong examples and clear structure.`;
      strengths = [
        `Strong demonstration of ${skillsText}`,
        'Excellent STAR structure',
        'Quantifiable results shown'
      ];
      improvements = [
        'Could add even more specific metrics',
        'Consider mentioning what you learned',
        'Maybe include team collaboration aspects'
      ];
    } else if (score >= 80) {
      feedback = `Very good answer! You've covered the key points well.`;
      strengths = [
        `Good demonstration of ${skillsText}`,
        'Clear examples provided',
        'Good structure'
      ];
      improvements = [
        'Add more quantifiable results',
        'Strengthen STAR structure',
        'Include more specific details'
      ];
    } else if (score >= 70) {
      feedback = `Good answer! You're on the right track.`;
      strengths = [
        `Relevant use of ${skillsText}`,
        'Addresses the question',
        'Good effort'
      ];
      improvements = [
        'Use STAR method more explicitly',
        'Add specific examples with numbers',
        'Structure your answer more clearly'
      ];
    } else if (score >= 60) {
      feedback = `Fair answer. You have some good points but need more specific examples.`;
      strengths = [
        'Addresses the question',
        'Shows basic understanding'
      ];
      improvements = [
        'Add specific examples using STAR',
        `Draw more from your ${skillsText} experience`,
        'Include quantifiable outcomes'
      ];
    } else if (score >= 50) {
      feedback = `Your answer needs improvement. It's a bit generic and lacks specific examples.`;
      strengths = [
        'You attempted to answer'
      ];
      improvements = [
        'Use STAR method with specific examples',
        `Reference your experience with ${skillsText}`,
        'Add measurable results'
      ];
    } else {
      feedback = `Your answer is too brief. Please provide a detailed response with specific examples from your experience.`;
      strengths = [
        'Participation noted'
      ];
      improvements = [
        'Write a much more detailed answer (150+ words)',
        `Use STAR method with ${skillsText} examples`,
        'Include quantifiable achievements'
      ];
    }
    
    while (strengths.length < 3) strengths.push('Good effort');
    while (improvements.length < 3) improvements.push('Add more specific examples');
    
    if (question?.text.includes('challenge') || question?.text.includes('difficult')) {
      suggestedAnswer = `Using the STAR method:
Situation: In my previous role, we faced a challenge with [describe context].
Task: I needed to [describe responsibility] using ${skillsText}.
Action: I took initiative by [specific actions], implementing [solution].
Result: This resulted in [quantifiable outcome], improving [metric] by [percentage].`;
    } else if (question?.text.includes('project')) {
      suggestedAnswer = `I led a project where we [describe scope]. Using ${skillsText}, I:
1. Planned and architected the solution
2. Implemented core features
3. Collaborated with stakeholders
The project succeeded in [quantifiable result].`;
    } else {
      suggestedAnswer = `A strong answer should:
1. Start with context from your ${skillsText} experience
2. Provide a specific STAR example
3. Highlight your role and contributions
4. Include quantifiable results
5. Reflect on learnings`;
    }
    
    return {
      score,
      feedback,
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
      suggestedAnswer
    };
  };

  const goToQuestion = useCallback((index: number) => {
    if (session && index >= 0 && index < session.questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [session]);

  const resetInterview = useCallback(() => {
    setSession(null);
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setFeedbacks(new Map());
    setError(null);
    setSessionComplete(false);
  }, []);

  const totalQuestions = session?.questions.length || 0;
  const answeredCount = answers.size;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const currentQuestion = session?.questions[currentQuestionIndex];
  const averageScore = feedbacks.size > 0
    ? Array.from(feedbacks.values()).reduce((acc, f) => acc + f.score, 0) / feedbacks.size
    : 0;

  return {
    session,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    answeredCount,
    progress,
    answers,
    feedbacks,
    averageScore,
    isLoading,
    error,
    sessionComplete,
    useFallback,
    apiAvailable,
    startInterview,
    submitAnswer,
    goToQuestion,
    resetInterview
  };
};