import { request, getToken, API_BASE_URL } from '../Client';

export const cvService = {
  analyze: async (cvText: string, jobRequirements?: string) => {
    try {
      return await request<any>('/cv/analyze', {
        method: 'POST',
        body: JSON.stringify({ cvText, jobRequirements }),
      });
    } catch (error) {
      console.error('CV analysis failed:', error);
      throw error;
    }
  },

  analyzeFile: async (file: File, jobRequirements?: string) => {
    try {
      const token = getToken();

      console.log('analyzeFile - token:', token ? 'EXISTS' : 'NULL');
    console.log('analyzeFile - API_BASE_URL:', API_BASE_URL);
      const formData = new FormData();
      formData.append('cvFile', file);
      if (jobRequirements) formData.append('jobRequirements', jobRequirements);

      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/cv/analyze-file`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let error: any;
        try {
          error = await response.json();
        } catch {
          error = { message: `Request failed with status ${response.status}`, status: response.status };
        }

        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfter = retryAfterHeader
          ? parseInt(retryAfterHeader, 10)
          : error.retryAfter || error.data?.retryAfter;

        let errorMessage = error.message || error.data?.message || error.detail;
        if (response.status === 429 && !errorMessage) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (!errorMessage) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        const apiError = new Error(errorMessage);
        (apiError as any).status = error.status || response.status;
        (apiError as any).response = {
          ...error,
          status: response.status,
          data: {
            ...error,
            retryAfter: retryAfter || (response.status === 429 ? 60 : undefined),
            code: response.status === 429 ? 'RATE_LIMIT' : error.code,
          },
        };
        if (retryAfter || response.status === 429) {
          (apiError as any).retryAfter = retryAfter || 60;
        }
        throw apiError;
      }

      return response.json();
    } catch (error) {
      console.error('CV file analysis failed:', error);
      throw error;
    }
  },
};
