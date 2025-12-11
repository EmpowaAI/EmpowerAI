/**
 * API utility for backend communication
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('empowerai-token');
};

// Set auth token in localStorage
const setToken = (token: string): void => {
  localStorage.setItem('empowerai-token', token);
};

// Remove auth token
const removeToken = (): void => {
  localStorage.removeItem('empowerai-token');
};

// API request helper
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      // Check if we're in production (Vercel) but using localhost
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const isUsingLocalhost = API_BASE.includes('localhost');
      
      if (isProduction && isUsingLocalhost) {
        throw new Error(
          `Cannot connect to server. The frontend is trying to connect to localhost in production. ` +
          `Please set VITE_API_URL environment variable in Vercel to: https://empowerai.onrender.com/api ` +
          `and redeploy. See docs/VERCEL_DEPLOYMENT.md for instructions.`
        );
      }
      
      throw new Error(
        `Cannot connect to server at ${API_BASE}. ` +
        `Please check if the backend is running. ` +
        `Backend should be at: https://empowerai.onrender.com/api`
      );
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    age?: number;
    province?: string;
    education?: string;
    skills?: string[];
  }) => {
    const response = await request<{
      status: string;
      token: string;
      data: { user: any };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await request<{
      status: string;
      token: string;
      data: { user: any };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeToken();
  },
};

// Twin API
export const twinAPI = {
  create: async (data: {
    skills?: string[];
    education?: string;
    interests?: string[];
    experience?: any;
  }) => {
    return request<{
      status: string;
      data: { twin: any };
    }>('/twin/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async () => {
    return request<{
      status: string;
      data: { twin: any };
    }>('/twin/my-twin');
  },

  simulate: async (pathIds?: string[]) => {
    return request<{
      status: string;
      data: { simulations: any };
    }>('/twin/simulate', {
      method: 'POST',
      body: JSON.stringify({ pathIds }),
    });
  },
};

// CV API
export const cvAPI = {
  analyze: async (cvText: string, jobRequirements?: string) => {
    return request<{
      status: string;
      data: { analysis: any };
    }>('/cv/analyze', {
      method: 'POST',
      body: JSON.stringify({ cvText, jobRequirements }),
    });
  },
};

// Interview API
export const interviewAPI = {
  start: async (type: string, difficulty?: string, company?: string) => {
    return request<{
      status: string;
      data: { session: any };
    }>('/interview/start', {
      method: 'POST',
      body: JSON.stringify({ type, difficulty, company }),
    });
  },

  answer: async (sessionId: string, questionId: string, response: string) => {
    return request<{
      status: string;
      data: { feedback: any };
    }>(`/interview/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, response }),
    });
  },

  getSession: async (sessionId: string) => {
    return request<{
      status: string;
      data: { session: any };
    }>(`/interview/${sessionId}`);
  },
};

// Opportunities API
export const opportunitiesAPI = {
  getAll: async () => {
    return request<{
      status: string;
      data: { opportunities: any[] };
    }>('/opportunities');
  },
};

export { getToken, setToken, removeToken };

