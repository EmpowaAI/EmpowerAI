// frontend/src/lib/api.ts
import { API_BASE_URL as API_BASE } from './apiBase';

// Demo mode is opt-in via env var; real APIs are used by default.
const USE_DEMO_MODE = import.meta.env.VITE_USE_DEMO_MODE === 'true';


const getToken = (): string | null => localStorage.getItem('empowerai-token');
const setToken = (token: string): void => localStorage.setItem('empowerai-token', token);
const removeToken = (): void => {
  localStorage.removeItem('empowerai-token');
  // Also clear other user-specific data from local storage on logout
  localStorage.removeItem('enrichedProfile');
  localStorage.removeItem('cvAnalysisData');
  localStorage.removeItem('twinData');
  localStorage.removeItem('twinCreated');
  localStorage.removeItem('cvCompleted');
  localStorage.removeItem('twinCompleted');
  localStorage.removeItem('empowermentScore');
};

const getStoredCvScore = (): number => {
  try {
    const comprehensive = localStorage.getItem('comprehensiveCVAnalysis');
    if (comprehensive) {
      const parsed = JSON.parse(comprehensive);
      const score = Number(parsed?.score);
      if (Number.isFinite(score) && score >= 0) return Math.round(score);
    }

    const cvScore = localStorage.getItem('cvScore');
    if (cvScore) {
      const score = Number(cvScore);
      if (Number.isFinite(score) && score >= 0) return Math.round(score);
    }
  } catch (error) {
    console.warn('Failed to parse stored CV score:', error);
  }
  return 0;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Determine timeout based on endpoint type
  let timeout = 45000; // default 45 seconds for standard CRUD
  if (typeof endpoint === 'string') {
    if (endpoint.includes('/auth/')) {
      timeout = 20000; // auth: 20 seconds (fail fast)
    } else if (endpoint.includes('/twin/')) {
      timeout = 150000; // AI tasks: 2.5 minutes (allow for cold starts + deep analysis)
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`API request to ${endpoint} timed out after ${timeout}ms`);
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`,
        status: response.status,
      }));
      const errorMessage =
        error.message || error.data?.message || error.detail || `HTTP error! status: ${response.status}`;
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.status || error.statusCode || response.status;
      (apiError as any).response = {
        ...error,
        status: response.status,
        statusCode: error.statusCode || response.status,
        data: {
          ...error,
          message: errorMessage,
          code: error.code || error.error,
        },
      };
      if (response.status === 429) {
        (apiError as any).isRateLimit = true;
        (apiError as any).retryAfter = error.retryAfter || 60;
      }
      if (response.status === 401) {
        removeToken();
        // Avoid redirect loops if already on login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      throw apiError;
    }

    const data = await response.json();
    try {
      const jobId = data?.data?.meta?.jobId;
      if (jobId) {
        localStorage.setItem('empowerai:last-ai-job-id', String(jobId));
        localStorage.setItem('empowerai:last-ai-job-at', new Date().toISOString());
      }
    } catch {
      // Ignore localStorage failures
    }
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle abort errors (timeout or manual cancellation)
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      const abortError = new Error(
        `Request to ${endpoint} was aborted. The operation took longer than ${timeout}ms or was cancelled.`
      );
      (abortError as any).isTimeout = true;
      throw abortError;
    }

    console.error('API Request Error:', error);
    throw error;
  }
};

// ============================================
// DEMO MODE IMPLEMENTATIONS
// ============================================

// Helper function to calculate empowerment score
const calculateEmpowermentScoreLocal = (data: any): number => {
  let score = 50; // Base score

  if (data.skills?.length > 0) score += data.skills.length * 5;
  if (data.experienceYears && data.experienceYears > 0) score += Math.min(data.experienceYears * 3, 20);
  if (data.education?.length > 0) score += 10;
  if (data.certifications?.length > 0) score += data.certifications.length * 3;
  if (data.projects?.length > 0) score += data.projects.length * 4;

  return Math.min(Math.max(score, 0), 100);
};

// Demo Auth API
export const authAPIDemo = {
  register: async (data: any) => {
    console.log('📝 Demo: Registering user:', data.email);
    await new Promise(resolve => setTimeout(resolve, 800));
    const token = 'demo-token-' + Date.now();
    setToken(token);
    return {
      status: 'success',
      data: {
        token,
        user: {
          id: 'demo-' + Date.now(),
          name: data.name,
          email: data.email,
          createdAt: new Date().toISOString()
        }
      }
    };
  },
  login: async (email: string, password: string) => {
    console.log('🔑 Demo: Logging in:', email);
    // Using password param to avoid unused variable warning
    if (password) {
      console.log('Password provided (length:', password.length, ')');
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    const token = 'demo-token-' + Date.now();
    setToken(token);
    return {
      status: 'success',
      data: {
        token,
        user: {
          id: 'demo-1',
          name: 'Siyanda Nkosi',
          email: email
        }
      }
    };
  },
  logout: () => {
    console.log('🚪 Demo: Logging out');
    removeToken();
  },
  validate: async () => {
    console.log('✅ Demo: Validating token');
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      status: 'success',
      data: {
        user: {
          id: 'demo-1',
          name: 'Siyanda Nkosi',
          email: 'demo@example.com'
        }
      }
    };
  }
};

// Demo Account API
export const accountAPIDemo = {
  verifyEmail: async (token: string) => {
    console.log('📧 Demo: Verifying email with token:', token);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      status: 'success',
      message: 'Email verified successfully'
    };
  },
  forgotPassword: async (email: string) => {
    console.log('🔐 Demo: Forgot password for:', email);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      status: 'success',
      message: 'If that email exists, a reset link has been sent.'
    };
  },
  resetPassword: async (token: string, newPassword: string) => {
    console.log('🔐 Demo: Resetting password with token:', token);
    // Using newPassword to avoid unused variable warning
    if (newPassword) {
      console.log('New password provided (length:', newPassword.length, ')');
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      status: 'success',
      message: 'Password reset successful'
    };
  }
};

// Demo Twin API
export const twinAPIDemo = {
  create: async (data: any) => {
    console.log('🤖 Demo: Creating twin with data:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const empowermentScore = calculateEmpowermentScoreLocal(data);

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
  },

  get: async () => {
    console.log('🤖 Demo: Getting twin');
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return mock twin data
    const mockTwin = localStorage.getItem('demo-twin');
    if (mockTwin) {
      return {
        status: 'success',
        data: JSON.parse(mockTwin),
      };
    }

    // Default mock twin
    return {
      status: 'success',
      data: {
        twin: {
          id: 'demo-twin-1',
          name: 'Siyanda Nkosi',
          skills: ['JavaScript', 'React', 'Node.js'],
          experienceYears: 3,
          education: ['Bachelor of Computer Science'],
          certifications: ['AWS Certified'],
          projects: ['E-commerce Platform', 'Portfolio Website'],
          empowermentScore: 72,
          incomeProjections: {
            threeMonth: 45000,
            sixMonth: 65000,
            oneYear: 85000
          }
        }
      },
    };
  },

  simulate: async (pathIds?: string[]) => {
    console.log('🎮 Demo: Running simulation with paths:', pathIds);
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

// Demo CV API
export const cvAPIDemo = {
  analyze: async (cvText: string, jobRequirements?: string) => {
    console.log('📄 Demo: Analyzing CV');
    // Using parameters to avoid unused variable warnings
    console.log('CV text length:', cvText.length);
    if (jobRequirements) {
      console.log('Job requirements provided:', jobRequirements.substring(0, 50) + '...');
    }
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      status: 'success',
      data: {
        score: 78,
        keywords: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        missingKeywords: ['TypeScript', 'GraphQL'],
        suggestions: [
          'Add more quantifiable achievements',
          'Include your GitHub profile',
          'Highlight your leadership experience'
        ],
        summary: 'Good technical foundation, could be stronger on modern frameworks'
      }
    };
  },
  
  analyzeFile: async (file: File, jobRequirements?: string) => {
    console.log('📄 Demo: Analyzing CV file:', file.name);
    if (jobRequirements) {
      console.log('Job requirements provided:', jobRequirements.substring(0, 50) + '...');
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      status: 'success',
      data: {
        score: 82,
        keywords: ['JavaScript', 'React', 'Node.js', 'AWS'],
        missingKeywords: ['Docker', 'Kubernetes'],
        suggestions: [
          'Add your LinkedIn profile',
          'Include relevant certifications',
          'Quantify your achievements with metrics'
        ],
        summary: 'Strong technical profile with good experience'
      }
    };
  }
};

// Demo Interview API
export const interviewAPIDemo = {
  start: async (type: string, difficulty?: string) => {
    console.log('🎤 Demo: Starting interview:', type, difficulty);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      status: 'success',
      data: {
        sessionId: 'demo-session-' + Date.now(),
        questions: [
          {
            id: 'q1',
            text: 'Tell me about yourself and your experience.',
            type: 'behavioral'
          },
          {
            id: 'q2',
            text: 'What are your greatest strengths and weaknesses?',
            type: 'behavioral'
          },
          {
            id: 'q3',
            text: 'Why do you want to work in this field?',
            type: 'motivational'
          }
        ]
      }
    };
  },
  
  answer: async (sessionId: string, questionId: string, response: string) => {
    console.log('🎤 Demo: Submitting answer for:', questionId);
    // Using parameters to avoid unused variable warnings
    console.log('Session ID:', sessionId);
    console.log('Response length:', response.length);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      status: 'success',
      data: {
        feedback: 'Good answer! Consider adding more specific examples.',
        score: 85,
        nextQuestion: 'q3'
      }
    };
  },
  
  getResults: async (sessionId: string) => {
    console.log('📊 Demo: Getting interview results for:', sessionId);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      status: 'success',
      data: {
        overallScore: 82,
        strengths: ['Communication', 'Technical knowledge'],
        areasForImprovement: ['Providing specific examples', 'Structuring answers'],
        questionBreakdown: [
          { question: 'Tell me about yourself', score: 85 },
          { question: 'What are your strengths?', score: 78 },
          { question: 'Why this field?', score: 82 }
        ]
      }
    };
  }
};

// Demo Opportunities API
export const opportunitiesAPIDemo = {
  getAll: async (filters?: any) => {
    console.log('💼 Demo: Getting opportunities with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockOpportunities = [
      {
        id: '1',
        title: 'Software Developer',
        company: 'Tech Solutions SA',
        location: 'Johannesburg',
        province: 'Gauteng',
        type: 'full-time',
        description: 'Looking for a skilled software developer...',
        requirements: ['3+ years experience', 'JavaScript', 'React'],
        salary: 'R40,000 - R60,000',
        deadline: '2025-04-30',
        postedDate: '2025-03-01'
      },
      {
        id: '2',
        title: 'Junior Web Developer',
        company: 'Digital Agency',
        location: 'Cape Town',
        province: 'Western Cape',
        type: 'full-time',
        description: 'Entry level position for passionate developers...',
        requirements: ['HTML', 'CSS', 'JavaScript'],
        salary: 'R25,000 - R35,000',
        deadline: '2025-05-15',
        postedDate: '2025-03-10'
      },
      {
        id: '3',
        title: 'Frontend Developer Internship',
        company: 'Startup Hub',
        location: 'Durban',
        province: 'KwaZulu-Natal',
        type: 'internship',
        description: '3-month paid internship program...',
        requirements: ['Basic JavaScript', 'Willingness to learn'],
        salary: 'R8,000 - R10,000',
        deadline: '2025-04-15',
        postedDate: '2025-03-05'
      }
    ];
    
    return {
      status: 'success',
      data: {
        opportunities: mockOpportunities,
        meta: {
          total: mockOpportunities.length,
          page: filters?.page || 1,
          limit: filters?.limit || 10
        }
      }
    };
  },
  
  getById: async (id: string) => {
    console.log('💼 Demo: Getting opportunity:', id);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      status: 'success',
      data: {
        opportunity: {
          id,
          title: 'Software Developer',
          company: 'Tech Solutions SA',
          location: 'Johannesburg',
          province: 'Gauteng',
          type: 'full-time',
          description: 'We are looking for a talented software developer to join our growing team. You will work on cutting-edge projects and collaborate with experienced developers.',
          requirements: ['3+ years experience in JavaScript', 'Experience with React', 'Knowledge of Node.js', 'Database experience'],
          responsibilities: ['Develop new features', 'Maintain existing code', 'Participate in code reviews', 'Collaborate with team'],
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          salary: 'R40,000 - R60,000',
          deadline: '2025-04-30',
          postedDate: '2025-03-01',
          applicationUrl: 'https://example.com/apply'
        }
      }
    };
  }
};

// Demo Applications API
export const applicationsAPIDemo = {
  track: async (opportunityId: string) => {
    console.log('📝 Demo: Tracking application for opportunity:', opportunityId);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      status: 'success',
      data: {
        application: {
          id: 'app-' + Date.now(),
          opportunityId,
          status: 'applied',
          appliedDate: new Date().toISOString()
        }
      }
    };
  },
  
  getMy: async () => {
    console.log('📋 Demo: Getting my applications');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'success',
      data: {
        applications: [
          {
            id: 'app-1',
            opportunityId: '1',
            opportunityTitle: 'Software Developer',
            company: 'Tech Solutions SA',
            status: 'applied',
            appliedDate: '2025-03-15T10:30:00Z'
          },
          {
            id: 'app-2',
            opportunityId: '2',
            opportunityTitle: 'Junior Web Developer',
            company: 'Digital Agency',
            status: 'interview',
            appliedDate: '2025-03-10T14:20:00Z'
          }
        ]
      }
    };
  },
  
  getStats: async () => {
    console.log('📊 Demo: Getting application stats');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      status: 'success',
      data: {
        total: 5,
        applied: 3,
        interview: 1,
        rejected: 1,
        success: 0
      }
    };
  }
};

// Demo Admin API
export const adminAPIDemo = {
  getStats: async (adminKey: string) => {
    console.log('👑 Demo: Getting admin stats with key:', adminKey.substring(0, 5) + '...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      status: 'success',
      data: {
        totalUsers: 1250,
        activeUsers: 432,
        totalOpportunities: 310,
        totalApplications: 89,
        systemHealth: {
          database: 'connected',
          aiService: 'connected',
          apiLatency: '120ms'
        }
      }
    };
  },

  getQueueHealth: async (adminKey: string) => {
    console.log('Admin demo: getting queue health with key:', adminKey.substring(0, 5) + '...');
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      status: 'OK',
      queue: {
        enabled: false,
        workerEnabled: false,
        redisUrlSet: false,
        counts: null
      },
      timestamp: new Date().toISOString()
    };
  },
  
  getCareerTaxonomy: async (adminKey: string) => {
    console.log('👑 Demo: Getting career taxonomy with key:', adminKey.substring(0, 5) + '...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'success',
      data: {
        industries: ['Technology', 'Finance', 'Healthcare', 'Education'],
        roles: ['Developer', 'Designer', 'Manager', 'Analyst'],
        skills: ['JavaScript', 'Python', 'Project Management', 'Data Analysis']
      }
    };
  },
  
  updateCareerTaxonomy: async (adminKey: string, taxonomy: any) => {
    console.log('👑 Demo: Updating career taxonomy with key:', adminKey.substring(0, 5) + '...', taxonomy);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      status: 'success',
      message: 'Taxonomy updated successfully'
    };
  },
  
  refreshOpportunities: async (adminKey: string, options: { backfill?: boolean; fetch?: boolean; async?: boolean }) => {
    console.log('👑 Demo: Refreshing opportunities with key:', adminKey.substring(0, 5) + '...', options);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      status: 'success',
      data: {
        added: 25,
        updated: 10,
        failed: 2,
        total: 37
      }
    };
  }
};

// Demo User API
export const userAPIDemo = {
  getProfile: async () => {
    console.log('👤 Demo: Getting user profile');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      status: 'success',
      data: {
        user: {
          id: 'demo-1',
          name: 'Siyanda Nkosi',
          email: 'demo@example.com',
          age: 28,
          province: 'Gauteng',
          education: ['Bachelor of Computer Science'],
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          interests: ['Web Development', 'AI', 'Mobile Apps'],
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-03-10T14:20:00Z'
        }
      }
    };
  },
  
  updateProfile: async (data: any) => {
    console.log('👤 Demo: Updating profile with:', data);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      status: 'success',
      data: {
        user: {
          id: 'demo-1',
          ...data,
          updatedAt: new Date().toISOString()
        }
      }
    };
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    console.log('🔐 Demo: Changing password');
    // Using parameters to avoid unused variable warnings
    console.log('Current password provided:', currentPassword ? 'yes' : 'no');
    console.log('New password length:', newPassword.length);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'success',
      message: 'Password changed successfully'
    };
  }
};

// Demo Stats API
export const statsAPIDemo = {
  getDashboardStats: async () => {
    console.log('📊 Demo: Getting dashboard stats');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      status: 'success',
      data: {
        empowermentScore: 72,
        threeMonthProjection: 45000,
        skillsMatched: 12,
        opportunitiesCount: 156,
        interviewsPracticed: 5,
        cvScore: 78,
        recentActivity: [
          { type: 'twin_created', date: '2025-03-15', description: 'Created your career twin' },
          { type: 'cv_analyzed', date: '2025-03-16', description: 'Uploaded and analyzed CV' },
          { type: 'interview_practice', date: '2025-03-17', description: 'Completed mock interview' }
        ]
      }
    };
  }
};

// Demo Progress API
export const progressAPIDemo = {
  saveTwinCompletion: async (twinId: string) => {
    console.log('📈 Demo: Saving twin completion:', twinId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      status: 'success',
      message: 'Progress saved'
    };
  },
  
  getProgress: async () => {
    console.log('📈 Demo: Getting progress');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      status: 'success',
      data: {
        modules: [
          { name: 'Career Twin', completed: true, score: 100 },
          { name: 'CV Analysis', completed: true, score: 78 },
          { name: 'Interview Practice', completed: false, score: 0 },
          { name: 'Job Applications', completed: false, score: 0 }
        ],
        overallProgress: 45,
        streak: 3
      }
    };
  },
  
  updateProgress: async (module: string, completed: boolean, score?: number) => {
    console.log('📈 Demo: Updating progress:', module, completed, score);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      status: 'success',
      message: 'Progress updated'
    };
  }
};

// Demo Chat API
export const chatAPIDemo = {
  sendMessage: async (message: string) => {
    console.log('💬 Demo: Sending message:', message);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = [
      "I understand you're interested in career development. Let me help you with that!",
      "That's a great question. Based on your profile, I'd recommend focusing on improving your technical skills.",
      "I can help you prepare for interviews. Would you like to practice some common questions?",
      "Your career twin suggests looking into opportunities in the tech industry.",
      "I've analyzed your CV and have some suggestions for improvement."
    ];
    
    return {
      reply: responses[Math.floor(Math.random() * responses.length)]
    };
  }
};

// ============================================
// REAL API IMPLEMENTATIONS
// ============================================

export const authAPIReal = {
  register: async (data: any) => {
    const response = await request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    if (response.data?.token) {
      setToken(response.data.token);
    } else if (response.token) {
      setToken(response.token);
    }
    return response;
  },
  login: async (email: string, password: string) => {
    const response = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (response.data?.token) {
      setToken(response.data.token);
    } else if (response.token) {
      setToken(response.token);
    }
    return response;
  },
  logout: () => removeToken(),
  validate: async () => request<any>('/auth/validate'),
};

export const accountAPIReal = {
  verifyEmail: async (token: string) => {
    return await request<any>(`/account/verify-email/${token}`);
  },
  forgotPassword: async (email: string) => {
    return await request<any>('/account/forgot-password', { 
      method: 'POST', 
      body: JSON.stringify({ email }) 
    });
  },
  resetPassword: async (token: string, newPassword: string) => {
    return await request<any>('/account/reset-password', { 
      method: 'POST', 
      body: JSON.stringify({ token, newPassword }) 
    });
  },
};

export const twinAPIReal = {
  create: async (data: any) => {
    try {
      console.log('Creating twin with data:', data);
      const response = await request<any>('/twin/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Calculate empowerment score if not provided by backend
      if (response .status === 'success') {
        if (!response.data?.twin && response.twin){
          return{
            status: 'success',
            data: {
              twin: response.twin
            }
          };
        }
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

export const cvAPIReal = {
  analyze: async (cvText: string, jobRequirements?: string) => {
    try {
      return await request<any>('/cv/analyze', {
        method: 'POST',
        body: JSON.stringify({ cvText, jobRequirements }),
      });
    } catch (error) {
      console.error('CV analysis failed:', error);
      throw error;
    }
  },

  analyzeFile: async (file: File, jobRequirements?: string) => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('cvFile', file);
      if (jobRequirements) {
        formData.append('jobRequirements', jobRequirements);
      }

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/cv/analyze-file`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          error = { message: `Request failed with status ${response.status}`, status: response.status };
        }

        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : error.retryAfter || error.data?.retryAfter;

        let errorMessage = error.message || error.data?.message || error.detail;
        if (response.status === 429 && !errorMessage) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (!errorMessage) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        const apiError = new Error(errorMessage);
        (apiError as any).status = error.status || response.status;
        (apiError as any).response = {
          ...error,
          status: response.status,
          data: {
            ...error,
            retryAfter: retryAfter || (response.status === 429 ? 60 : undefined),
            code: response.status === 429 ? 'RATE_LIMIT' : error.code,
          },
        };

        if (retryAfter || response.status === 429) {
          (apiError as any).retryAfter = retryAfter || 60;
        }

        throw apiError;
      }

      return response.json();
    } catch (error) {
      console.error('CV file analysis failed:', error);
      throw error;
    }
  },
};

export const interviewAPIReal = {
  start: async (type: string, difficulty?: string) => {
    try {
      return await request<any>('/interview/start', {
        method: 'POST',
        body: JSON.stringify({ type, difficulty }),
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      throw error;
    }
  },

  answer: async (sessionId: string, questionId: string, response: string) => {
    try {
      return await request<any>(`/interview/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ questionId, response }),
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw error;
    }
  },

  getResults: async (sessionId: string) => {
    try {
      return await request<any>(`/interview/${sessionId}/results`);
    } catch (error) {
      console.error('Failed to get interview results:', error);
      throw error;
    }
  },
};

export const opportunitiesAPIReal = {
  getAll: async (filters?: {
    province?: string;
    type?: string;
    skills?: string;
    careerGoals?: string;
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
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

export const applicationsAPIReal = {
  track: async (opportunityId: string) => {
    try {
      return await request<any>('/applications', {
        method: 'POST',
        body: JSON.stringify({ opportunityId }),
      });
    } catch (error) {
      console.error('Failed to track application:', error);
      throw error;
    }
  },
  getMy: async () => {
    try {
      return await request<any>('/applications');
    } catch (error) {
      console.error('Failed to get applications:', error);
      throw error;
    }
  },
  getStats: async () => {
    try {
      return await request<any>('/applications/stats');
    } catch (error) {
      console.error('Failed to get application stats:', error);
      throw error;
    }
  },
};

export const adminAPIReal = {
  getStats: async (adminKey: string) => {
    const response = await adminRequest<any>('/admin/stats', adminKey);
    return response;
  },
  getQueueHealth: async (adminKey: string) => {
    const response = await adminRequest<any>('/queue/health', adminKey);
    return response;
  },
  getCareerTaxonomy: async (adminKey: string) => {
    const response = await adminRequest<any>('/admin/career-taxonomy', adminKey);
    return response;
  },
  updateCareerTaxonomy: async (adminKey: string, taxonomy: any) => {
    const response = await adminRequest<any>('/admin/career-taxonomy', adminKey, {
      method: 'PUT',
      body: JSON.stringify({ taxonomy }),
    });
    return response;
  },
  refreshOpportunities: async (adminKey: string, options: { backfill?: boolean; fetch?: boolean; async?: boolean }) => {
    const query = options.async ? '?async=true' : '';
    const body = JSON.stringify({
      backfill: options.backfill !== false,
      fetch: options.fetch !== false,
    });
    const response = await adminRequest<any>(`/admin/refresh-opportunities${query}`, adminKey, {
      method: 'POST',
      body,
    });
    return response;
  },
};

export const statsAPIReal = {
  getDashboardStats: async () => {
    try {
      let careerGoalsFilter: string | undefined;
      try {
        const twinDataRaw = localStorage.getItem('twinData');
        if (twinDataRaw) {
          const twinData = JSON.parse(twinDataRaw);
          const goals = twinData?.careerGoals || twinData?.interests || [];
          if (Array.isArray(goals) && goals.length > 0) {
            careerGoalsFilter = goals.join(',');
          }
        }
      } catch (e) {
        // Ignore parse errors
      }

      const [twinResponse, opportunitiesResponse] = await Promise.allSettled([
        twinAPIReal.get(),
        opportunitiesAPIReal.getAll(careerGoalsFilter ? { careerGoals: careerGoalsFilter, limit: 1 } : { limit: 1 }),
      ]);

      const twin = twinResponse.status === 'fulfilled' ? twinResponse.value.data?.twin : null;
      const opportunities =
        opportunitiesResponse.status === 'fulfilled' ? opportunitiesResponse.value.data?.opportunities || [] : [];
      const totalOpportunities =
        opportunitiesResponse.status === 'fulfilled' ? opportunitiesResponse.value.meta?.totalFiltered : null;

      let skillsMatched = 0;
      try {
        const comprehensive = localStorage.getItem('comprehensiveCVAnalysis');
        if (comprehensive) {
          const parsed = JSON.parse(comprehensive);
          const skills = parsed?.sections?.skills;
          if (Array.isArray(skills)) skillsMatched = skills.length;
        } else {
          const cvSkills = localStorage.getItem('cvSkills') ? JSON.parse(localStorage.getItem('cvSkills')!) : [];
          if (Array.isArray(cvSkills)) skillsMatched = cvSkills.length;
        }
      } catch (e) {
        // ignore parse errors
      }

      return {
        status: 'success',
        data: {
          empowermentScore: twin?.empowermentScore || 0,
          threeMonthProjection: twin?.incomeProjections?.threeMonth || 0,
          skillsMatched,
          opportunitiesCount: typeof totalOpportunities === 'number' ? totalOpportunities : opportunities.length,
          interviewsPracticed: 0,
          cvScore: getStoredCvScore(),
        },
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  },
};

export const progressAPIReal = {
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

export const chatAPIReal = {
  sendMessage: async (message: string) => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: message }] 
        }),
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

export const userAPIReal = {
  getProfile: async () => {
    try {
      return await request<any>('/user/profile');
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    try {
      return await request<any>('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      return await request<any>('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },
};

const adminRequest = async <T>(endpoint: string, adminKey: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (adminKey) headers.set('x-admin-key', adminKey);

  const timeout = 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`,
        status: response.status,
      }));
      const errorMessage = error.message || error.data?.message || error.detail || `HTTP error! status: ${response.status}`;
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.status || error.statusCode || response.status;
      (apiError as any).response = {
        ...error,
        status: response.status,
        statusCode: error.statusCode || response.status,
        data: {
          ...error,
          message: errorMessage,
          code: error.code || error.error,
        },
      };
      throw apiError;
    }

    const data = await response.json();
    clearTimeout(timeoutId);
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
      const timeoutError = new Error('Request timed out. Please check your connection and try again.');
      (timeoutError as any).isTimeout = true;
      throw timeoutError;
    }
    throw error;
  }
};

// ============================================
// EXPORTS - Choose between real and demo APIs
// ============================================

export const authAPI = USE_DEMO_MODE ? authAPIDemo : authAPIReal;
export const accountAPI = USE_DEMO_MODE ? accountAPIDemo : accountAPIReal;
export const twinAPI = USE_DEMO_MODE ? twinAPIDemo : twinAPIReal;
export const cvAPI = USE_DEMO_MODE ? cvAPIDemo : cvAPIReal;
export const interviewAPI = USE_DEMO_MODE ? interviewAPIDemo : interviewAPIReal;
export const opportunitiesAPI = USE_DEMO_MODE ? opportunitiesAPIDemo : opportunitiesAPIReal;
export const applicationsAPI = USE_DEMO_MODE ? applicationsAPIDemo : applicationsAPIReal;
export const adminAPI = USE_DEMO_MODE ? adminAPIDemo : adminAPIReal;
export const statsAPI = USE_DEMO_MODE ? statsAPIDemo : statsAPIReal;
export const progressAPI = USE_DEMO_MODE ? progressAPIDemo : progressAPIReal;
export const chatAPI = USE_DEMO_MODE ? chatAPIDemo : chatAPIReal;
export const userAPI = USE_DEMO_MODE ? userAPIDemo : userAPIReal;

export { getToken, setToken, removeToken, calculateEmpowermentScoreLocal as calculateEmpowermentScore };
