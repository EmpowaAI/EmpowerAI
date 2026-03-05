import { request } from './core';
import { calculateEmpowermentScore } from './helpers';

export const twinAPI = {
  create: async (data: any) => {
    try {
      console.log('Creating twin with data:', data);
      const response = await request<any>('/twin/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.data?.twin && !response.data.twin.empowermentScore) {
        response.data.twin.empowermentScore = calculateEmpowermentScore(data);
      }

      return response;
    } catch (error) {
      console.error('Twin creation failed:', error);
      throw error;
    }
  },

  get: async () => {
    try {
      return await request<any>('/twin/my-twin');
    } catch (error) {
      console.error('Failed to get twin:', error);
      throw error;
    }
  },

  simulate: async (pathIds?: string[]) => {
    try {
      return await request<any>('/twin/simulate', {
        method: 'POST',
        body: JSON.stringify({ pathIds }),
      });
    } catch (error) {
      console.error('Simulation failed:', error);
      throw error;
    }
  },
};

export const twinAPIDemo = {
  create: async (data: any) => {
    try {
      console.log('Demo: Creating twin with data:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const empowermentScore = calculateEmpowermentScore(data);
      return {
        status: 'success',
        data: {
          twin: {
            id: `twin_${Date.now()}`,
            ...data,
            empowermentScore,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      console.error('Demo: Failed to create twin', error);
      throw new Error('Failed to create twin');
    }
  },

  get: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const mockTwin = localStorage.getItem('demo-twin');
    if (mockTwin) {
      return {
        status: 'success',
        data: JSON.parse(mockTwin),
      };
    }

    return {
      status: 'success',
      data: null,
    };
  },

  simulate: async (pathIds?: string[]) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      status: 'success',
      data: {
        simulationId: `sim_${Date.now()}`,
        results: {
          matches: pathIds ? pathIds.length * 0.8 : 0.75,
          recommendations: [
            'Focus on improving your technical skills',
            'Consider adding more project experience',
            'Network with professionals in your target industry',
          ],
          estimatedTime: '3-6 months',
        },
      },
    };
  },
};

