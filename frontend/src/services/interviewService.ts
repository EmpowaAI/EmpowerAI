// frontend/src/services/interviewService.ts
import { API_BASE_URL } from '../lib/apiBase';

const getToken = () => localStorage.getItem('empowerai-token');

export interface ServiceInterviewQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: string;
}

export interface ServiceInterviewSession {
  sessionId: string;
  type: string;
  difficulty: string;
  company?: string;
  questions: ServiceInterviewQuestion[];
  currentQuestionIndex: number;
  feedback: any[];
  startedAt?: string;
  cvUsed?: boolean;
  jobDescriptionUsed?: boolean;
}

export interface ServiceInterviewFeedback {
  questionId: string;
  response: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer?: string;
}

export interface CVContext {
  sections?: {
    about?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
    achievements?: string[];
  };
  score?: number;
  readinessLevel?: string;
}

class InterviewService {
  private connectionCache: { available: boolean | null; timestamp: number } = {
    available: null,
    timestamp: 0
  };
  private CACHE_DURATION = 60000;

  async startInterview(
    type: string,
    difficulty: string = "medium",
    company?: string,
    cvData?: CVContext,
    jobDescription?: string
  ): Promise<ServiceInterviewSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({
          type,
          difficulty,
          company: company || null,
          cvData,
          jobDescription
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        throw new Error(`Failed to start interview: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting interview:', error);
      throw new Error('Failed to start interview');
    }
  }

  async submitAnswer(
    sessionId: string,
    questionId: string,
    response: string,
    cvData?: CVContext
  ): Promise<ServiceInterviewFeedback> {
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/interview/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({
          questionId,
          response,
          cvData
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error('Server error:', errorData);
        throw new Error(`Failed to submit answer: ${apiResponse.status}`);
      }

      return await apiResponse.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw new Error('Failed to submit answer');
    }
  }

  async testConnection(): Promise<boolean> {
    // Use cache if valid
    if (this.connectionCache.available !== null &&
        Date.now() - this.connectionCache.timestamp < this.CACHE_DURATION) {
      return this.connectionCache.available;
    }

    // Try multiple endpoints
    const endpoints = [
      { url: `${API_BASE_URL.replace(/\/api\/?$/, '')}/api/health`, name: 'backend' },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          this.connectionCache = {
            available: true,
            timestamp: Date.now()
          };
          return true;
        }
      } catch {
        // Silently continue to next endpoint
        continue;
      }
    }

    // All endpoints failed
    this.connectionCache = {
      available: false,
      timestamp: Date.now()
    };
    return false;
  }
}

// Create and export a single instance
export const interviewService = new InterviewService();
