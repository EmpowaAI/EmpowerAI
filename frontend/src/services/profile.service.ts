// frontend/src/services/profile.service.ts

import { twinAPI, opportunitiesAPI } from '../lib/api';
import type { 
  TwinProfile, 
  CVAnalysisData, 
  EnrichedProfile,
  MarketInsights,
  SkillGap,
  ActionPlan,
  CareerPath,
  MarketInsight,
  GrowingIndustry,
  SalaryBenchmark
} from '../types/profile.types';

export class ProfileService {
  
  // Create or update twin with CV context
  async createTwinFromCV(cvAnalysis: CVAnalysisData, userResponses: Record<string, any> = {}): Promise<EnrichedProfile> {
    try {
      // Extract structured data from CV
      const profileData: TwinProfile = {
        name: userResponses.name || this.extractNameFromCV(cvAnalysis),
        skills: cvAnalysis.sections?.skills || [],
        experience: cvAnalysis.sections?.experience || [],
        education: cvAnalysis.sections?.education?.[0] || '',
        achievements: cvAnalysis.sections?.achievements || [],
        industry: this.inferIndustry(cvAnalysis),
        careerStage: this.inferCareerStage(cvAnalysis),
        province: userResponses.province || this.inferLocation(cvAnalysis),
        goals: userResponses.goals || this.inferGoals(cvAnalysis),
        challenges: userResponses.challenges || this.inferChallenges(cvAnalysis),
      };

      // Call API to create twin
      const response = await twinAPI.create(profileData);
      
      if (response.status === 'success' && response.data?.twin) {
        const twin = response.data.twin;
        
        // Enrich with market insights
        const enriched = await this.enrichProfile(twin, cvAnalysis);
        
        // Store complete profile
        localStorage.setItem('enrichedProfile', JSON.stringify(enriched));
        localStorage.setItem('twinCreated', 'true');
        
        return enriched;
      }
      
      throw new Error('Failed to create twin');
    } catch (error) {
      console.error('Error creating twin from CV:', error);
      return this.getMockEnrichedProfile({}, cvAnalysis);
    }
  }

  // Enrich profile with market insights
  async enrichProfile(twin: any, cvAnalysis?: CVAnalysisData): Promise<EnrichedProfile> {
    try {
      // Fetch market opportunities based on skills
      const opportunitiesResponse = await opportunitiesAPI.getAll({
        skills: twin.skills?.join(','),
        province: twin.province,
        limit: 10
      });

      const opportunities = opportunitiesResponse.data?.opportunities || [];

      // Generate skill gaps and recommendations
      const skillGaps = this.identifySkillGaps(twin.skills || [], twin.industry);
      
      // Generate market insights
      const marketInsights = this.generateMarketInsights(
        twin.skills || [],
        twin.province || 'Gauteng',
        opportunities
      );

      // Create action plan
      const actionPlan = this.createActionPlan(
        cvAnalysis,
        twin,
        skillGaps,
        marketInsights
      );

      // Generate career paths
      const recommendedPaths = this.generateCareerPaths(twin, marketInsights);

      return {
        ...twin,
        cvData: cvAnalysis ? {
          skills: cvAnalysis.sections?.skills || [],
          experience: cvAnalysis.sections?.experience || [],
          education: cvAnalysis.sections?.education || [],
          achievements: cvAnalysis.sections?.achievements || [],
          recommendations: cvAnalysis.recommendations || [],
          score: cvAnalysis.score || 0,
          readinessLevel: cvAnalysis.readinessLevel || '',
          analysisDate: new Date().toISOString()
        } : undefined,
        marketInsights,
        skillGaps,
        actionPlan,
        recommendedPaths,
        empowermentScore: twin.empowermentScore || this.calculateEmpowermentScore(twin, marketInsights)
      };
    } catch (error) {
      console.error('Error enriching profile:', error);
      return this.getMockEnrichedProfile(twin, cvAnalysis);
    }
  }

  // Identify skill gaps based on market demand
  private identifySkillGaps(currentSkills: string[], industry?: string): SkillGap[] {
    const inDemandSkills: Record<string, string[]> = {
      'Technology': ['Cloud Computing', 'DevOps', 'Machine Learning', 'Cybersecurity', 'AWS'],
      'Finance': ['Financial Modeling', 'Risk Analysis', 'Blockchain', 'Data Analytics', 'CPA'],
      'Healthcare': ['Health Informatics', 'Telemedicine', 'Patient Care', 'Medical Coding', 'HIPAA'],
      'Engineering': ['Project Management', 'AutoCAD', 'Renewable Energy', 'Quality Assurance', 'Six Sigma'],
    };

    const industrySkills = inDemandSkills[industry || 'Technology'] || inDemandSkills.Technology;
    
    return industrySkills
      .filter(skill => !currentSkills.includes(skill))
      .map(skill => ({
        skill,
        importance: this.determineImportance(skill),
        resources: this.getLearningResources(skill)
      }))
      .slice(0, 5);
  }

  // Generate market insights
  private generateMarketInsights(skills: string[], province: string, opportunities: any[]): MarketInsights {
    const provinceSalaryMap: Record<string, { entry: number; mid: number; senior: number }> = {
      'Gauteng': { entry: 250000, mid: 450000, senior: 750000 },
      'Western Cape': { entry: 230000, mid: 420000, senior: 700000 },
      'KwaZulu-Natal': { entry: 200000, mid: 380000, senior: 650000 },
      'Other': { entry: 180000, mid: 350000, senior: 600000 }
    };

    const salaries = provinceSalaryMap[province] || provinceSalaryMap.Other;

    const topOpportunities: MarketInsight[] = opportunities.map((opp: any) => ({
      title: opp.title || 'Software Developer',
      matchScore: this.calculateMatchScore(skills, opp.requirements || []),
      reason: this.generateMatchReason(opp, skills),
      salary: {
        min: opp.salary?.min || salaries.entry,
        max: opp.salary?.max || salaries.mid,
        currency: 'ZAR'
      },
      demandLevel: this.determineDemandLevel(opp),
      growthRate: opp.growthRate || 15,
      locations: [opp.location || province, ...(opp.remote ? ['Remote'] : [])]
    }));

    const growingIndustries: GrowingIndustry[] = [
      { name: 'Technology', growth: 25, relevantRoles: ['Developer', 'Data Scientist', 'Cloud Architect'] },
      { name: 'Renewable Energy', growth: 35, relevantRoles: ['Solar Technician', 'Engineer', 'Project Manager'] },
      { name: 'Healthcare', growth: 20, relevantRoles: ['Nurse', 'Technician', 'Administrator'] },
      { name: 'Financial Services', growth: 15, relevantRoles: ['Analyst', 'Advisor', 'Compliance Officer'] }
    ];

    const salaryBenchmarks: SalaryBenchmark = {
      entry: salaries.entry,
      mid: salaries.mid,
      senior: salaries.senior,
      byLocation: provinceSalaryMap
    };

    return {
      topOpportunities,
      inDemandSkills: this.getInDemandSkills(opportunities),
      growingIndustries,
      salaryBenchmarks
    };
  }

  // Create action plan
  private createActionPlan(
    cvAnalysis: CVAnalysisData | undefined,
    twin: any,
    skillGaps: SkillGap[],
    marketInsights: MarketInsights
  ): ActionPlan {
    const immediate = [];

    // 1. Immediate tasks from CV recommendations
    if (cvAnalysis?.recommendations?.length) {
      immediate.push({
        task: cvAnalysis.recommendations[0],
        priority: 'high' as const,
        timeframe: 'This week',
        reason: 'Direct improvement identified from your CV analysis'
      });
    }

    // 2. Immediate task for missing keywords
    if (cvAnalysis?.missingKeywords?.length) {
      immediate.push({
        task: `Optimize CV keywords: ${cvAnalysis.missingKeywords.slice(0, 3).join(', ')}`,
        priority: 'high' as const,
        timeframe: 'Next 48 hours',
        reason: 'Improve ATS compatibility and market visibility'
      });
    }

    // 3. Short term tasks from skill gaps
    const shortTerm = skillGaps.map(gap => ({
      task: `Acquire ${gap.skill} proficiency`,
      targetDate: '1-3 months',
      expectedOutcome: `Bridge the ${gap.importance} gap for ${twin.industry || 'your target industry'}`
    }));

    // 4. Long term goal based on goals
    const longTerm = [{
      goal: twin.goals || 'Career Advancement',
      milestones: [
        `Complete ${skillGaps.length > 0 ? skillGaps[0].skill : 'Key Skill'} certification`,
        'Apply for 5 matched high-growth opportunities',
        'Achieve target salary benchmark'
      ],
      projectedTimeline: '6-12 months'
    }];

    return {
      immediate: immediate.length > 0 ? immediate : [{ 
        task: 'Set specific career goals', 
        priority: 'medium' as const, 
        timeframe: 'Next week', 
        reason: 'Provides clearer direction for AI recommendations' 
      }],
      shortTerm: shortTerm.length > 0 ? shortTerm : [{ 
        task: 'Network with industry professionals', 
        targetDate: '3 months', 
        expectedOutcome: 'Gain hidden market insights' 
      }],
      longTerm
    };
  }

  // Generate career paths
  private generateCareerPaths(twin: any, insights: MarketInsights): CareerPath[] {
    const paths: CareerPath[] = [
      {
        title: `${twin?.industry || 'Technology'} Professional`,
        description: `Leverage your ${twin?.skills?.length || 0} skills in a professional role`,
        matchPercentage: this.calculatePathMatch(twin, 'professional'),
        steps: [
          'Update CV and LinkedIn',
          'Apply to 5-10 positions weekly',
          'Prepare for technical interviews',
          'Negotiate salary based on market rates'
        ],
        potentialIncome: insights.salaryBenchmarks?.mid || 450000
      },
      {
        title: 'Skills Development & Certification',
        description: 'Enhance your qualifications for better opportunities',
        matchPercentage: this.calculatePathMatch(twin, 'development'),
        steps: [
          'Identify key certifications in your field',
          'Enroll in online courses',
          'Join study groups or bootcamps',
          'Apply for learnerships or internships'
        ],
        potentialIncome: insights.salaryBenchmarks?.entry || 250000
      },
      {
        title: 'Entrepreneurship / Freelancing',
        description: 'Start your own business or offer freelance services',
        matchPercentage: this.calculatePathMatch(twin, 'entrepreneur'),
        steps: [
          'Register on freelance platforms',
          'Build portfolio website',
          'Network with potential clients',
          'Set up business registration if needed'
        ],
        potentialIncome: insights.salaryBenchmarks?.mid * 1.2 || 540000
      }
    ];

    return paths.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  // Calculate empowerment score
  private calculateEmpowermentScore(twin: any, insights: MarketInsights): number {
    let score = 50; // Base score
    
    // Skills contribution (up to 20 points)
    score += Math.min((twin.skills?.length || 0) * 2, 20);
    
    // Experience contribution (up to 15 points)
    if (twin.experience?.length > 0) score += 15;
    
    // Education contribution (up to 10 points)
    if (twin.education) score += 10;
    
    // Market alignment (up to 15 points)
    const opportunities = insights.topOpportunities || [];
    if (opportunities.length > 0) {
      const avgMatch = opportunities.reduce((sum: number, opp: MarketInsight) => sum + opp.matchScore, 0) / opportunities.length;
      score += avgMatch * 0.15;
    }
    
    return Math.min(Math.round(score), 100);
  }

  // Helper methods
  private determineImportance(skill: string): 'critical' | 'recommended' | 'optional' {
    const criticalSkills = ['JavaScript', 'Python', 'AWS', 'React', 'Node.js', 'SQL', 'Java'];
    const recommendedSkills = ['TypeScript', 'Docker', 'MongoDB', 'GraphQL', 'Kubernetes'];
    
    if (criticalSkills.includes(skill)) return 'critical';
    if (recommendedSkills.includes(skill)) return 'recommended';
    return 'optional';
  }

  private getLearningResources(skill: string): SkillGap['resources'] {
    const resources: Record<string, SkillGap['resources']> = {
      'JavaScript': [
        { title: 'The Complete JavaScript Course', type: 'course', provider: 'Udemy', duration: '30 hours', cost: 'R500' },
        { title: 'JavaScript Certification', type: 'certification', provider: 'freeCodeCamp', duration: '300 hours', cost: 'Free' }
      ],
      'Python': [
        { title: 'Python for Everybody', type: 'course', provider: 'Coursera', duration: '40 hours', cost: 'Free' },
        { title: 'PCAP Certification', type: 'certification', provider: 'Python Institute', duration: '100 hours', cost: 'R2000' }
      ],
      'AWS': [
        { title: 'AWS Certified Cloud Practitioner', type: 'certification', provider: 'AWS', duration: '20 hours', cost: 'R1500' },
        { title: 'Ultimate AWS Course', type: 'course', provider: 'A Cloud Guru', duration: '40 hours', cost: 'R800' }
      ]
    };

    return resources[skill] || [
      { title: `Introduction to ${skill}`, type: 'course', provider: 'LinkedIn Learning', duration: '20 hours', cost: 'Free with trial' },
      { title: `${skill} Fundamentals`, type: 'workshop', provider: 'Local Tech Hub', duration: '2 days', cost: 'R1500' }
    ];
  }

  private calculateMatchScore(skills: string[], requirements: string[]): number {
    if (!requirements.length) return 50;
    const matched = skills.filter(s => 
      requirements.some(r => r.toLowerCase().includes(s.toLowerCase()) || 
                            s.toLowerCase().includes(r.toLowerCase()))
    ).length;
    return Math.min(Math.round((matched / requirements.length) * 100), 100);
  }

  private getDemandPercentage(skill: string): number {
    const demandMap: Record<string, number> = {
      'JavaScript': 85,
      'Python': 80,
      'AWS': 75,
      'React': 70,
      'Node.js': 65,
      'TypeScript': 60,
      'Docker': 55,
      'SQL': 80
    };
    return demandMap[skill] || 50;
  }

  private getInDemandSkills(opportunities: any[]): string[] {
    const skillFrequency: Record<string, number> = {};
    opportunities.forEach(opp => {
      (opp.requirements || []).forEach((req: string) => {
        skillFrequency[req] = (skillFrequency[req] || 0) + 1;
      });
    });
    
    return Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);
  }

  private determineDemandLevel(opportunity: any): 'High' | 'Medium' | 'Low' {
    if (opportunity.applications && opportunity.applications < 10) return 'High';
    if (opportunity.applications && opportunity.applications < 30) return 'Medium';
    return 'Low';
  }

  private generateMatchReason(opportunity: any, skills: string[]): string {
    const matchedSkills = skills.filter(s => 
      (opportunity.requirements || []).some((r: string) => r.toLowerCase().includes(s.toLowerCase()))
    );
    
    if (matchedSkills.length > 0) {
      return `Your skills in ${matchedSkills.slice(0, 3).join(', ')} match this role`;
    }
    return 'This role aligns with your career profile';
  }

  private calculatePathMatch(twin: any, pathType: string): number {
    switch(pathType) {
      case 'professional':
        return Math.min(85, 50 + (twin?.skills?.length || 0) * 2);
      case 'development':
        return 75;
      case 'entrepreneur':
        return 60;
      default:
        return 50;
    }
  }

  // Mock data for fallback
  getMockEnrichedProfile(twin: any, cvAnalysis?: CVAnalysisData): EnrichedProfile {
    const defaultTwin = twin || {
      name: 'User',
      skills: cvAnalysis?.sections?.skills || ['JavaScript', 'React', 'Communication'],
      industry: 'Technology',
      province: 'Gauteng'
    };

    const defaultInsights: MarketInsights = {
      topOpportunities: [
        {
          title: 'Software Developer',
          matchScore: 85,
          reason: 'Your technical skills match current market demand',
          salary: { min: 300000, max: 600000, currency: 'ZAR' },
          demandLevel: 'High',
          growthRate: 20,
          locations: ['Johannesburg', 'Cape Town', 'Remote']
        },
        {
          title: 'Frontend Developer',
          matchScore: 78,
          reason: 'Strong match with your React experience',
          salary: { min: 280000, max: 550000, currency: 'ZAR' },
          demandLevel: 'High',
          growthRate: 18,
          locations: ['Johannesburg', 'Remote']
        }
      ],
      inDemandSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Python'],
      growingIndustries: [
        { name: 'Technology', growth: 25, relevantRoles: ['Developer', 'Data Scientist', 'Cloud Architect'] },
        { name: 'FinTech', growth: 30, relevantRoles: ['Developer', 'Security Analyst'] }
      ],
      salaryBenchmarks: {
        entry: 250000,
        mid: 450000,
        senior: 750000,
        byLocation: {
          'Gauteng': { entry: 250000, mid: 450000, senior: 750000 },
          'Western Cape': { entry: 230000, mid: 420000, senior: 700000 },
          'KwaZulu-Natal': { entry: 200000, mid: 380000, senior: 650000 }
        }
      }
    };

    return {
      ...defaultTwin,
      cvData: cvAnalysis ? {
        skills: cvAnalysis.sections?.skills || [],
        experience: cvAnalysis.sections?.experience || [],
        education: cvAnalysis.sections?.education || [],
        achievements: cvAnalysis.sections?.achievements || [],
        recommendations: cvAnalysis.recommendations || [],
        score: cvAnalysis.score || 0,
        readinessLevel: cvAnalysis.readinessLevel || '',
        analysisDate: new Date().toISOString()
      } : undefined,
      marketInsights: defaultInsights,
      skillGaps: [
        {
          skill: 'TypeScript',
          importance: 'recommended',
          resources: [{ title: 'TypeScript Course', type: 'course', provider: 'Udemy', duration: '20 hours', cost: 'R400' }]
        },
        {
          skill: 'AWS',
          importance: 'critical',
          resources: [{ title: 'AWS Certification', type: 'certification', provider: 'AWS', duration: '30 hours', cost: 'R1500' }]
        }
      ],
      actionPlan: {
        immediate: [
          { 
            task: 'Update your CV with missing keywords', 
            priority: 'high', 
            timeframe: 'This week', 
            reason: 'Improve ATS compatibility' 
          }
        ],
        shortTerm: [
          { 
            task: 'Complete TypeScript certification', 
            targetDate: '3 months', 
            expectedOutcome: 'Better job prospects' 
          }
        ],
        longTerm: [
          { 
            goal: 'Secure a senior developer position', 
            milestones: ['Complete AWS certification', 'Build portfolio'], 
            projectedTimeline: '6 months' 
          }
        ]
      },
      recommendedPaths: [
        {
          title: 'Technology Professional',
          description: 'Pursue a career in tech',
          matchPercentage: 85,
          steps: ['Update CV', 'Apply to jobs', 'Prepare for interviews'],
          potentialIncome: 450000
        },
        {
          title: 'Skills Development',
          description: 'Enhance your qualifications',
          matchPercentage: 75,
          steps: ['Get certified', 'Build portfolio'],
          potentialIncome: 350000
        }
      ],
      empowermentScore: 72
    };
  }

  // CV data extraction helpers
  private extractNameFromCV(_cvAnalysis: CVAnalysisData): string {
    // In a real implementation, you'd extract name from CV text
    return 'User';
  }

  private inferIndustry(cvAnalysis: CVAnalysisData): string {
    const skills = cvAnalysis.sections?.skills || [];
    const skillSet = skills.join(' ').toLowerCase();
    
    if (skillSet.includes('javascript') || skillSet.includes('python') || skillSet.includes('react')) {
      return 'Technology';
    }
    if (skillSet.includes('finance') || skillSet.includes('accounting') || skillSet.includes('audit')) {
      return 'Finance';
    }
    if (skillSet.includes('health') || skillSet.includes('nurse') || skillSet.includes('medical')) {
      return 'Healthcare';
    }
    if (skillSet.includes('engineer') || skillSet.includes('mechanical') || skillSet.includes('civil')) {
      return 'Engineering';
    }
    
    return 'General';
  }

  private inferCareerStage(cvAnalysis: CVAnalysisData): string {
    const experience = cvAnalysis.sections?.experience || [];
    if (experience.length === 0) return 'Entry Level';
    if (experience.length <= 2) return 'Early Career';
    if (experience.length <= 5) return 'Mid Career';
    return 'Established';
  }

  private inferLocation(_cvAnalysis: CVAnalysisData): string {
    // In a real implementation, you'd extract location from CV
    return 'Gauteng';
  }

  private inferGoals(_cvAnalysis: CVAnalysisData): string {
    // Infer goals from achievements and experience
    return 'Career growth and professional development';
  }

  private inferChallenges(_cvAnalysis: CVAnalysisData): string {
    // Infer challenges from missing keywords and recommendations
    return 'Keeping skills current with market demands';
  }
}

// Export a singleton instance
export const profileService = new ProfileService();