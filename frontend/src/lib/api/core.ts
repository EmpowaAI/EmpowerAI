export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

export const getToken = (): string | null => localStorage.getItem('empowerai-token');
export const setToken = (token: string): void => localStorage.setItem('empowerai-token', token);
export const removeToken = (): void => localStorage.removeItem('empowerai-token');

export const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const timeout = endpoint.includes('/auth/') ? 30000 : 60000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Request failed with status ${response.status}`,
        status: response.status,
      }));

      const errorMessage =
        error.message || error.data?.message || error.detail || `HTTP error! status: ${response.status}`;
      const apiError = new Error(errorMessage);
      (apiError as any).status = error.status || error.statusCode || response.status;
      (apiError as any).response = {
        ...error,
        status: response.status,
        statusCode: error.statusCode || response.status,
        data: {
          ...error,
          message: errorMessage,
          code: error.code || error.error,
        },
      };

      if (response.status === 429) {
        (apiError as any).isRateLimit = true;
        (apiError as any).retryAfter = error.retryAfter || 60;
      }

      throw apiError;
    }

    const data = await response.json();
    try {
      const jobId = data?.data?.meta?.jobId;
      if (jobId) {
        localStorage.setItem('empowerai:last-ai-job-id', String(jobId));
        localStorage.setItem('empowerai:last-ai-job-at', new Date().toISOString());
      }
    } catch {
      // Ignore localStorage failures
    }
    clearTimeout(timeoutId);
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('API Request Error:', error);

    if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
      const timeoutError = new Error('Request timed out. Please check your connection and try again.');
      (timeoutError as any).isTimeout = true;
      throw timeoutError;
    }

    throw error;
  }
};
