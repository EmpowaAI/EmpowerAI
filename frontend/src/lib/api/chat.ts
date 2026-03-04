import { API_BASE } from './core';

export const chatAPI = {
  sendMessage: async (message: string) => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        reply: data.data?.reply || data.reply || 'I received your message but got an empty response.',
      };
    } catch (error: any) {
      console.error('Chat API error:', error);
      throw error;
    }
  },
};

