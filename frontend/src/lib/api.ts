const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Frontend API base URL

const getToken = (): string | null => localStorage.getItem('empowerai-token');
const setToken = (token: string): void => localStorage.setItem('empowerai-token', token);
const removeToken = (): void => localStorage.removeItem('empowerai-token');

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Add timeout for requests (30 seconds for auth, 60 for others)
  const timeout = endpoint.includes('/auth/') ? 30000 : 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { 
      ...options, 
      headers,
      signal: controller.signal
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Request failed with status ${response.status}`,
        status: response.status 
      }));
      // Use the error message from backend if available
      // Backend sends: { status: 'error', message: '...', ... }
      const errorMessage = error.message || error.data?.message || error.detail || `HTTP error! status: ${response.status}`;
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.status || error.statusCode || response.status;
      (apiError as any).response = {
        ...error,
        status: response.status,
        statusCode: error.statusCode || response.status,
        data: {
          ...error,
          message: errorMessage, // Ensure message is always set
          code: error.code || error.error
        }
      };
      // Set isRateLimit flag if it's a 429 error
      if (response.status === 429) {
        (apiError as any).isRateLimit = true;
        (apiError as any).retryAfter = error.retryAfter || 60;
      }
      throw apiError;
    }
    
    const data = await response.json();
    clearTimeout(timeoutId); // Clear timeout after successful response
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('API Request Error:', error);
    
    // Handle timeout/abort errors
    if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
      const timeoutError = new Error('Request timed out. Please check your connection and try again.');
      (timeoutError as any).isTimeout = true;
      throw timeoutError;
    }
    
    throw error;
  }
};

export const authAPI = {
  register: async (data: any) => {
    const response = await request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    // Backend returns token in response.data.token
    if (response.data?.token) {
      setToken(response.data.token);
    } else if (response.token) {
      // Fallback for legacy format
      setToken(response.token);
    }
    return response;
  },
  login: async (email: string, password: string) => {
    const response = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    // Backend returns token in response.data.token
    if (response.data?.token) {
      setToken(response.data.token);
    } else if (response.token) {
      // Fallback for legacy format
      setToken(response.token);
    }
    return response;
  },
  logout: () => removeToken(),
  validate: async () => request<any>('/auth/validate'),
};

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

export const twinAPI = {
  create: async (data: any) => {
    try {
      console.log('Creating twin with data:', data);
      const response = await request<any>('/twin/create', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
      
      // Calculate empowerment score if not provided by backend
      if (response.data?.twin && !response.data.twin.empowermentScore) {
        response.data.twin.empowermentScore = calculateEmpowermentScoreLocal(data);
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
        body: JSON.stringify({ pathIds }) 
      });
    } catch (error) {
      console.error('Simulation failed:', error);
      throw error;
    }
  },
};

export const cvAPI = {
  analyze: async (cvText: string, jobRequirements?: string) => {
    try {
      return await request<any>('/cv/analyze', { 
        method: 'POST', 
        body: JSON.stringify({ cvText, jobRequirements }) 
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
      // Don't set Content-Type - browser will set it with boundary for FormData
      
      const response = await fetch(`${API_BASE}/cv/analyze-file`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          // If JSON parsing fails, create error object from status
          error = { 
            message: `Request failed with status ${response.status}`,
            status: response.status 
          };
        }
        
        // Extract retryAfter from response headers or error body
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfter = retryAfterHeader 
          ? parseInt(retryAfterHeader, 10) 
          : error.retryAfter || error.data?.retryAfter;
        
        // For 429 errors, use a more user-friendly message
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
            code: response.status === 429 ? 'RATE_LIMIT' : error.code
          }
        };
        
        // Add retryAfter to error for easy access
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

export const interviewAPI = {
  start: async (type: string, difficulty?: string) => {
    try {
      return await request<any>('/interview/start', { 
        method: 'POST', 
        body: JSON.stringify({ type, difficulty }) 
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
        body: JSON.stringify({ questionId, response }) 
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
  }
};

export const opportunitiesAPI = {
  getAll: async (filters?: { province?: string; type?: string; skills?: string; careerGoals?: string; q?: string; page?: number; limit?: number; sort?: string }) => {
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

export const statsAPI = {
  getDashboardStats: async () => {
    try {
      // This will combine data from twin, opportunities, and CV analysis
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
        twinAPI.get(),
        opportunitiesAPI.getAll(
          careerGoalsFilter ? { careerGoals: careerGoalsFilter, limit: 1 } : { limit: 1 }
        )
      ]);
      
      const twin = twinResponse.status === 'fulfilled' ? twinResponse.value.data?.twin : null;
      const opportunities = opportunitiesResponse.status === 'fulfilled' 
        ? opportunitiesResponse.value.data?.opportunities || [] 
        : [];
      const totalOpportunities = opportunitiesResponse.status === 'fulfilled'
        ? opportunitiesResponse.value.meta?.totalFiltered
        : null;
      
      // Calculate stats from real data
      const cvSkills = localStorage.getItem('cvSkills') 
        ? JSON.parse(localStorage.getItem('cvSkills')!) 
        : [];
      
      return {
        status: 'success',
        data: {
          empowermentScore: twin?.empowermentScore || 0,
          threeMonthProjection: twin?.incomeProjections?.threeMonth || 0,
          skillsMatched: cvSkills.length || 0,
          opportunitiesCount: typeof totalOpportunities === 'number' ? totalOpportunities : opportunities.length,
          interviewsPracticed: 0, // TODO: Get from interview sessions
          cvScore: 72, // TODO: Calculate from CV analysis history
        }
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw error;
    }
  },
};

export const progressAPI = {
  saveTwinCompletion: async (twinId: string) => {
    try {
      return await request<any>('/progress/twin-completed', {
        method: 'POST',
        body: JSON.stringify({ twinId })
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
        body: JSON.stringify({ module, completed, score })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  }
};

// Chat API - calls the backend, which proxies to AI service
// Uses direct fetch (no auth token) since chat is public
export const chatAPI = {
  sendMessage: async (message: string) => {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return in the format expected by the component
      return {
        reply: data.data?.reply || data.reply || 'I received your message but got an empty response.'
      };
    } catch (error: any) {
      console.error('Chat API error:', error);
      throw error;
    }
  },
};

// User API - profile management
export const userAPI = {
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
        body: JSON.stringify(data)
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
        body: JSON.stringify({ currentPassword, newPassword })
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }
};

// Demo/fallback implementation for development
export const twinAPIDemo = {
  create: async (data: any) => {
    try {
      console.log("Demo: Creating twin with data:", data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const empowermentScore = calculateEmpowermentScoreLocal(data);
      
      return {
        status: 'success',
        data: {
          twin: {
            id: `twin_${Date.now()}`,
            ...data,
            empowermentScore,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      console.error('Demo: Failed to create twin', error);
      throw new Error('Failed to create twin');
    }
  },
  
  get: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock twin data
    const mockTwin = localStorage.getItem('demo-twin');
    if (mockTwin) {
      return {
        status: 'success',
        data: JSON.parse(mockTwin)
      };
    }
    
    return {
      status: 'success',
      data: null
    };
  },
  
  simulate: async (pathIds?: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      status: 'success',
      data: {
        simulationId: `sim_${Date.now()}`,
        results: {
          matches: pathIds ? pathIds.length * 0.8 : 0.75,
          recommendations: [
            "Focus on improving your technical skills",
            "Consider adding more project experience",
            "Network with professionals in your target industry"
          ],
          estimatedTime: "3-6 months"
        }
      }
    };
  }
};

export { getToken, setToken, removeToken, calculateEmpowermentScoreLocal as calculateEmpowermentScore };
