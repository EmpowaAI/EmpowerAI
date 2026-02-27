import { request } from '../Client';

const calculateEmpowermentScore = (data: any): number => {
  let score = 50;
  if (data.skills?.length > 0) score += data.skills.length * 5;
  if (data.experienceYears && data.experienceYears > 0) score += Math.min(data.experienceYears * 3, 20);
  if (data.education?.length > 0) score += 10;
  if (data.certifications?.length > 0) score += data.certifications.length * 3;
  if (data.projects?.length > 0) score += data.projects.length * 4;
  return Math.min(Math.max(score, 0), 100);
};

export const twinService = {
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

export { calculateEmpowermentScore };
