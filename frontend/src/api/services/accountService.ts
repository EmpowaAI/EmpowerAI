import { request, removeToken } from '../Client';
import {type AuthUser } from './authService';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;       // matches backend DTO field name
  confirmPassword: string;   // required by backend DTO validation
}

export interface RequestEmailChangePayload {
  newEmail: string;  // matches backend DTO field name
  password: string;  // current password required to confirm identity
}

interface AccountMessageResponse {
  message: string;
}

interface AccountUserResponse {
  message: string;
  user: AuthUser;
}

// ─────────────────────────────────────────────
// Account Service
// ─────────────────────────────────────────────

export const accountService = {
  // GET /api/account/verify?token=abc
  // Public — called when user clicks the link in their registration email
  verifyEmail: async (token: string): Promise<AccountUserResponse> => {
    return request<AccountUserResponse>(`/account/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },

  // POST /api/account/forgot-password
  // Public — triggers a password reset email
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<AccountMessageResponse> => {
    return request<AccountMessageResponse>('/account/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // POST /api/account/reset-password
  // Public — submits new password using token from email
  resetPassword: async (payload: ResetPasswordPayload): Promise<AccountMessageResponse> => {
    return request<AccountMessageResponse>('/account/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // POST /api/account/change-email  (protected)
  // Sends a verification link to the new email address
  requestEmailChange: async (payload: RequestEmailChangePayload): Promise<AccountMessageResponse> => {
    return request<AccountMessageResponse>('/account/change-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // GET /api/account/confirm-email?token=abc
  // Public — called when user clicks the link in their email change confirmation email
  confirmEmailChange: async (token: string): Promise<AccountUserResponse> => {
    return request<AccountUserResponse>(`/account/confirm-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },

  // POST /api/account/delete-request  (protected)
  // Sends a confirmation email before permanently deleting the account
  requestAccountDeletion: async (): Promise<AccountMessageResponse> => {
    return request<AccountMessageResponse>('/account/delete-request', {
      method: 'POST',
    });
  },

  // GET /api/account/confirm-delete?token=abc
  // Public — called when user clicks the deletion confirmation link in their email
  // Clears local token since the account no longer exists after this
  confirmAccountDeletion: async (token: string): Promise<AccountMessageResponse> => {
    const response = await request<AccountMessageResponse>(
      `/account/confirm-delete?token=${encodeURIComponent(token)}`,
      { method: 'GET' }
    );
    removeToken();
    return response;
  },
};
