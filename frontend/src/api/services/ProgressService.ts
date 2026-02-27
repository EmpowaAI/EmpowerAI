import { request } from '../Client';

export const progressService = {
  saveTwinCompletion: async (twinId: string) => {
    try {
      return await request<any>('/progress/twin-completed', {
        method: 'POST',
        body: JSON.stringify({ twinId }),
      });
    } catch (error) {
      console.error('Failed to save twin completion:', error);
      throw error;
    }
  },

  getProgress: async () => {
    try {
      return await request<any>('/progress/my-progress');
    } catch (error) {
      console.error('Failed to get progress:', error);
      throw error;
    }
  },

  updateProgress: async (module: string, completed: boolean, score?: number) => {
    try {
      return await request<any>('/progress/update', {
        method: 'POST',
        body: JSON.stringify({ module, completed, score }),
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  },
};
