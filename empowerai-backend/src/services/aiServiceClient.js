/**
 * Centralized AI Service Client
 * Handles all communication with the Python AI service
 * Includes retry logic, timeout handling, and error management
 */

const axios = require('axios');

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, ''); // Remove trailing slash
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second

// Log configuration
console.log('[AI Service Client] Initialized with:', {
  aiServiceUrl: AI_SERVICE_URL,
  baseURL: `${AI_SERVICE_URL}/api`,
  timeout: REQUEST_TIMEOUT
});

// Create axios instance with default config
const aiServiceClient = axios.create({
  baseURL: `${AI_SERVICE_URL}/api`,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
aiServiceClient.interceptors.request.use(
  (config) => {
    console.log(`[AI Service] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[AI Service] Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
aiServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a Cloudflare challenge (HTML response with 429)
    const isCloudflareChallenge = error.response?.status === 429 && 
      typeof error.response?.data === 'string' && 
      error.response.data.includes('Just a moment');

    // Retry on timeout, network errors, or rate limit errors (429)
    const shouldRetry = (
      (axios.isAxiosError(error) && 
       (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED' || !error.response)) ||
      (error.response?.status === 429) // Rate limit (including Cloudflare)
    );

    if (shouldRetry && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          // Exponential backoff: 2s, 4s, 8s (longer for rate limits)
          const delay = isCloudflareChallenge 
            ? RETRY_DELAY_MS * (2 ** i) * 2 // Double delay for Cloudflare
            : RETRY_DELAY_MS * (2 ** i);
          
          await new Promise((resolve) => setTimeout(resolve, delay));
          console.log(`[AI Service] Retry attempt ${i + 1}/${MAX_RETRIES} for ${originalRequest.url}${isCloudflareChallenge ? ' (Cloudflare rate limit)' : ''}`);
          return aiServiceClient(originalRequest);
        } catch (retryError) {
          console.warn(`[AI Service] Retry ${i + 1} failed:`, retryError.message);
          if (i === MAX_RETRIES - 1) {
            if (isCloudflareChallenge) {
              throw new Error('AI service is rate limited by Cloudflare. Please wait a moment and try again.');
            }
            throw new Error(`AI service unavailable after ${MAX_RETRIES} retries. Please try again later.`);
          }
        }
      }
    }

    // Handle specific error responses
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const url = error.config?.url || 'unknown endpoint';

      console.error(`[AI Service] Error response from ${url}:`, {
        status,
        message: data?.message || data?.detail || error.message
      });

      if (status === 429) {
        if (isCloudflareChallenge) {
          // Create a custom error with retry information
          const rateLimitError = new Error('AI service is temporarily rate limited. Please wait a moment and try again.');
          rateLimitError.isRateLimit = true;
          rateLimitError.retryAfter = 30; // Suggest 30 seconds
          throw rateLimitError;
        }
        // Regular 429 rate limit
        const rateLimitError = new Error('AI service is rate limited. Please try again in a few moments.');
        rateLimitError.isRateLimit = true;
        rateLimitError.retryAfter = 60; // Suggest 60 seconds
        throw rateLimitError;
      } else if (status === 503) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      } else if (status === 500) {
        throw new Error(data?.message || data?.detail || 'AI service encountered an error. Please try again.');
      } else if (status === 400) {
        throw new Error(data?.message || data?.detail || 'Invalid request to AI service.');
      } else if (status === 404) {
        throw new Error(`AI service endpoint ${url} not found. Please check if the service is configured correctly.`);
      }
    }
    
    // Log connection errors with more detail
    if (!error.response) {
      console.error('[AI Service] Connection error:', {
        message: error.message,
        code: error.code,
        baseURL: AI_SERVICE_URL
      });
    }

    return Promise.reject(error);
  }
);

module.exports = aiServiceClient;

