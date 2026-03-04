import { request } from './core';

export const interviewAPI = {
  start: async (type: string, difficulty?: string) => {
    try {
      return await request<any>('/interview/start', {
        method: 'POST',
        body: JSON.stringify({ type, difficulty }),
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      throw error;
    }
  },

  answer: async (sessionId: string, questionId: string, response: string) => {
    try {
      return await request<any>(`/interview/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ questionId, response }),
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  },

  getResults: async (sessionId: string) => {
    try {
      return await request<any>(`/interview/${sessionId}`);
    } catch (error) {
      console.error('Failed to get interview results:', error);
      throw error;
    }
  },
};

