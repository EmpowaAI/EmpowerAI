import { request } from './core';

export const opportunitiesAPI = {
  getAll: async (filters?: { province?: string; type?: string; skills?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.province) queryParams.append('province', filters.province);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.skills) queryParams.append('skills', filters.skills);

      const queryString = queryParams.toString();
      const url = `/opportunities${queryString ? `?${queryString}` : ''}`;
      return await request<any>(url);
    } catch (error) {
      console.error('Failed to get opportunities:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      return await request<any>(`/opportunities/${id}`);
    } catch (error) {
      console.error('Failed to get opportunity:', error);
      throw error;
    }
  },

  getRecommendedJobs: async () => {
    try {
      const response = await request<any>('/opportunities');
      const opportunities = response?.data?.opportunities || [];

      return {
        status: 'success',
        data: opportunities.map((item: any) => ({
          id: item._id || item.id,
          title: item.title,
          company: item.company || 'Company Not Specified',
          type: item.type || 'Opportunity',
          match: Math.min(95, Math.max(60, item.matchScore || 78)),
          posted: item.createdAt || item.postedDate || '',
          salary: item.salaryRange || item.salary || undefined,
          location: item.province || item.location || undefined,
        })),
      };
    } catch (error) {
      console.error('Failed to get recommended jobs:', error);
      throw error;
    }
  },
};

