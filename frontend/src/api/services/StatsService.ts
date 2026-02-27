import { twinService } from './TwinService';
import { opportunityService } from './OpportunityService';

export const statsService = {
  getDashboardStats: async () => {
    try {
      const [twinResponse, opportunitiesResponse] = await Promise.allSettled([
        twinService.get(),
        opportunityService.getAll(),
      ]);

      const twin = twinResponse.status === 'fulfilled' ? twinResponse.value.data?.twin : null;
      const opportunities =
        opportunitiesResponse.status === 'fulfilled'
          ? opportunitiesResponse.value.data?.opportunities || []
          : [];

      const cvSkills = localStorage.getItem('cvSkills')
        ? JSON.parse(localStorage.getItem('cvSkills')!)
        : [];

      return {
        status: 'success',
        data: {
          empowermentScore: twin?.empowermentScore || 0,
          threeMonthProjection: twin?.incomeProjections?.threeMonth || 0,
          skillsMatched: cvSkills.length || 0,
          opportunitiesCount: opportunities.length,
          interviewsPracticed: 0, // TODO: Get from interview sessions
          cvScore: 72, // TODO: Calculate from CV analysis history
        },
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  },
};
