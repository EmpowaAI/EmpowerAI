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
      const payload: Record<string, unknown> = {
        type,
        difficulty,
      };

      const companyValue = typeof company === 'string' ? company.trim() : '';
      if (companyValue) payload.company = companyValue;
      if (cvData) payload.cvData = cvData;
      if (typeof jobDescription === 'string' && jobDescription.trim()) {
        payload.jobDescription = jobDescription.trim();
      }

      const response = await fetch(`${API_BASE_URL}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const correlationId =
          response.headers.get('X-Correlation-ID') ||
          response.headers.get('x-correlation-id');

        const errorText = await response.text();
        let errorJson: any = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // ignore
        }

        const messageFromBody =
          errorJson?.message ||
          errorJson?.detail ||
          errorJson?.error ||
          errorJson?.data?.message;

        const correlationFromBody = errorJson?.correlationId;
        const finalCorrelationId = correlationFromBody || correlationId || undefined;

        console.error('Server error:', {
          status: response.status,
          correlationId: finalCorrelationId,
          body: errorText
        });

        throw new Error(
          `${messageFromBody || `Failed to start interview: ${response.status}`}${finalCorrelationId ? ` (Correlation ID: ${finalCorrelationId})` : ''}`
        );
      }

      const jsonResponse = await response.json();
      // Backend now wraps session in a 'data' property
      return jsonResponse.data.session || jsonResponse.session || jsonResponse;
    } catch (error) {
      console.error('Error starting interview:', error);
      if (error instanceof Error) throw error;
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
        const correlationId =
          apiResponse.headers.get('X-Correlation-ID') ||
          apiResponse.headers.get('x-correlation-id');

        const errorText = await apiResponse.text();
        let errorJson: any = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // ignore
        }

        const messageFromBody =
          errorJson?.message ||
          errorJson?.detail ||
          errorJson?.error ||
          errorJson?.data?.message;

        const correlationFromBody = errorJson?.correlationId;
        const finalCorrelationId = correlationFromBody || correlationId || undefined;

        console.error('Server error:', {
          status: apiResponse.status,
          correlationId: finalCorrelationId,
          body: errorText
        });

        throw new Error(
          `${messageFromBody || `Failed to submit answer: ${apiResponse.status}`}${finalCorrelationId ? ` (Correlation ID: ${finalCorrelationId})` : ''}`
        );
      }

      return await apiResponse.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      if (error instanceof Error) throw error;
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
