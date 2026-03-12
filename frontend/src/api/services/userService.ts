import { request } from '../Client';
import { type AuthUser } from './authService';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface UpdateUserPayload {
  name?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

interface UserResponse {
  user: AuthUser;
}

interface UserUpdateResponse {
  message: string;
  user: AuthUser;
}

interface MessageResponse {
  message: string;
}

// ─────────────────────────────────────────────
// User Service
// ─────────────────────────────────────────────

export const userService = {
  // GET /api/user/profile  (protected)
  // Returns the current authenticated user's profile
  getProfile: async (): Promise<AuthUser> => {
    const response = await request<UserResponse>('/user/profile', {
      method: 'GET',
    });
    return response.user;
  },

  // PATCH /api/user/profile  (protected)
  // Updates the current authenticated user's profile
  updateProfile: async (payload: UpdateUserPayload): Promise<UserUpdateResponse> => {
    return request<UserUpdateResponse>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // PATCH /api/user/change-password  (protected)
  // Changes the current authenticated user's password
  changePassword: async (payload: ChangePasswordPayload): Promise<MessageResponse> => {
    return request<MessageResponse>('/user/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
