import { request, setToken, removeToken } from '../Client';

export const authService = {
  register: async (data: any) => {
    const response = await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data?.accessToken) {
      setToken(response.data.accessToken);
    }
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.accessToken) {
      setToken(response.data.accessToken);
    }
    return response;
  },

  logout: async () => {
    try {
      await request<any>('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Even if the API call fails, clear the token locally
      console.error('Logout API error:', error);
    } finally {
      removeToken();
    }
  },

  validate: async () => request<any>('/auth/validate'),
};
