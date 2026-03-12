import { request, setToken, removeToken } from '../Client';

// ─────────────────────────────────────────────
// Types matching your backend DTOs / responses
// ─────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  data?: {
    token?: string;
    user?: AuthUser;
  };
  token?: string;
  user?: AuthUser;
  message?: string;
}

// ─────────────────────────────────────────────
// Helper — extract token from either shape your
// backend might return: { token } or { data: { token } }
// ─────────────────────────────────────────────
const extractToken = (response: AuthResponse): string | null =>
  response.data?.token ?? response.token ?? null;

const extractUser = (response: AuthResponse): AuthUser | null =>
  response.data?.user ?? response.user ?? null;

// ─────────────────────────────────────────────
// Auth Service
// ─────────────────────────────────────────────

export const authService = {
  // POST /api/auth/register
  // Returns pending user { id, name, email } — no token yet (email verification required)
  register: async (payload: RegisterPayload): Promise<{ user: AuthUser | null; message?: string }> => {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      user: extractUser(response),
      message: response.message,
    };
  },

  // POST /api/auth/login
  login: async (payload: LoginPayload): Promise<{ user: AuthUser | null; token: string | null }> => {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const token = extractToken(response);
    if (token) setToken(token);

    return {
      token,
      user: extractUser(response),
    };
  },

  // GET /api/auth/validate  (protected — sends Bearer token automatically via client)
  validate: async (): Promise<AuthUser | null> => {
    const response = await request<AuthResponse>('/auth/validate', {
      method: 'GET',
    });

    return extractUser(response);
  },

  // POST /api/auth/logout  (protected — notifies server, then clears local token)
  logout: async (): Promise<void> => {
    try {
      await request<AuthResponse>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear local token even if the server call fails
      removeToken();
    }
  },
};
