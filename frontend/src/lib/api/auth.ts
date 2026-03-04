import { getToken, request, removeToken, setToken } from './core';

const extractTokenFromResponse = (response: any): string | null => {
  const candidates = [
    response?.data?.token,
    response?.token,
    response?.data?.accessToken,
    response?.accessToken,
    response?.data?.jwt,
    response?.jwt,
    response?.data?.authToken,
    response?.authToken,
    response?.data?.user?.token,
    response?.data?.data?.token,
    response?.data?.data?.accessToken,
    response?.data?.session?.token,
    response?.session?.token,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
};

export const authAPI = {
  register: async (data: any) => {
    const response = await request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    const token = extractTokenFromResponse(response);
    if (token) setToken(token);
    return response;
  },

  login: async (email: string, password: string) => {
    console.log('LOGIN: Starting login process...');
    const response = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    const token = extractTokenFromResponse(response);
    console.log('LOGIN: Response received:', { status: response.status, hasToken: !!token });

    if (token) {
      setToken(token);
      console.log('LOGIN: Token stored.');
    } else {
      console.error('LOGIN: No token in response.', response);
      throw new Error('Login succeeded but no auth token was returned by the server. Please contact support.');
    }

    const storedToken = getToken();
    console.log('LOGIN: Verification - Token in localStorage:', storedToken ? 'YES' : 'NO');
    return response;
  },

  logout: () => removeToken(),
  validate: async () => request<any>('/auth/validate'),
};

