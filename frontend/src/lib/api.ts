const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = (): string | null => localStorage.getItem('empowerai-token');
const setToken = (token: string): void => localStorage.setItem('empowerai-token', token);
const removeToken = (): void => localStorage.removeItem('empowerai-token');

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { 
      ...options, 
      headers 
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const authAPI = {
  register: async (data: any) => {
    const response = await request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    if (response.token) setToken(response.token);
    return response;
  },
  login: async (email: string, password: string) => {
    const response = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (response.token) setToken(response.token);
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

// Chat API - calls the AI service directly
const AI_SERVICE_BASE = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api';

export const chatAPI = {
  sendMessage: async (message: string) => {
    const url = `${AI_SERVICE_BASE}/chat`;
    console.log('Chat API: Calling', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      console.log('Chat API: Response status', response.status);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        console.error('Chat API error response:', error);
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Chat API error:', error);
      // More specific error messages
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(`Cannot connect to AI service at ${url}. Please check if the service is running and the URL is correct.`);
      }
      throw error;
    }
  },
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