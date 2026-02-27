import { request } from '../Client';

export const accountService = {
  verifyEmail: async (token: string) => {
    return await request<any>(`/account/verify-email/${token}`);
  },

  forgotPassword: async (email: string) => {
    return await request<any>('/account/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await request<any>('/account/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};
