import { request } from './core';

export const accountAPI = {
  forgotPassword: async (email: string) => {
    return request<any>('/account/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return request<any>('/account/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: password }),
    });
  },

  verifyEmail: async (token: string) => {
    return request<any>(`/account/verify?token=${encodeURIComponent(token)}`);
  },
};

