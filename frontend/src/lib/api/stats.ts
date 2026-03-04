import { opportunitiesAPI } from './opportunities';
import { twinAPI } from './twin';

export const statsAPI = {
  getDashboardStats: async () => {
    try {
      const [twinResponse, opportunitiesResponse] = await Promise.allSettled([
        twinAPI.get(),
        opportunitiesAPI.getAll(),
      ]);

      const twin = twinResponse.status === 'fulfilled' ? twinResponse.value.data?.twin : null;
      const opportunities =
        opportunitiesResponse.status === 'fulfilled' ? opportunitiesResponse.value.data?.opportunities || [] : [];

      const cvSkills = localStorage.getItem('cvSkills') ? JSON.parse(localStorage.getItem('cvSkills')!) : [];

      return {
        status: 'success',
        data: {
          empowermentScore: twin?.empowermentScore || 0,
          threeMonthProjection: twin?.incomeProjections?.threeMonth || 0,
          skillsMatched: cvSkills.length || 0,
          opportunitiesCount: opportunities.length,
          interviewsPracticed: 0,
          cvScore: 72,
        },
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  },
};

