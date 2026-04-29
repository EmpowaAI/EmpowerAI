import { request } from './core';

export const opportunitiesAPI = {
  getAll: async (filters?: {
    province?: string;
    type?: string;
    skills?: string;
    careerGoals?: string;
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
    minScore?: number;
    strictCareer?: boolean;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.province) queryParams.append('province', filters.province);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.skills) queryParams.append('skills', filters.skills);
      if (filters?.careerGoals) queryParams.append('careerGoals', filters.careerGoals);
      if (filters?.q) queryParams.append('q', filters.q);
      if (typeof filters?.page === 'number') queryParams.append('page', String(filters.page));
      if (typeof filters?.limit === 'number') queryParams.append('limit', String(filters.limit));
      if (filters?.sort) queryParams.append('sort', filters.sort);
      if (typeof filters?.minScore === 'number') queryParams.append('minScore', String(filters.minScore));
      if (typeof filters?.strictCareer === 'boolean') queryParams.append('strictCareer', String(filters.strictCareer));

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

