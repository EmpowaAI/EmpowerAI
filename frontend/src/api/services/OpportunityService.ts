import { request } from '../Client';

export const opportunityService = {
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
};
