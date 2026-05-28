const axios = require('axios');
const FormData = require('form-data');
const { v4: uuid } = require('uuid');

// ================= CONFIG =================
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
const AI_SERVICE_TOKEN = process.env.AI_SERVICE_TOKEN;

const REQUEST_TIMEOUT = process.env.NODE_ENV === 'production' ? 90000 : 30000;
const MAX_RETRIES = 3;
const BASE_DELAY = 2000;

// ================= CIRCUIT BREAKER =================
let failureCount = 0;
let lastFailureTime = 0;

const FAILURE_THRESHOLD = 5;
const COOLDOWN_TIME = 60000;

const isCircuitOpen = () =>
  failureCount >= FAILURE_THRESHOLD && Date.now() - lastFailureTime < COOLDOWN_TIME;

const recordFailure = () => {
  failureCount++;
  lastFailureTime = Date.now();
};

const resetCircuit = () => {
  failureCount = 0;
};

// ================= LOGGER =================
const log = (level, message, data = {}) => {
  if (process.env.NODE_ENV === 'production' && level === 'log') return;
  console[level](`[AI Client] ${new Date().toISOString()} - ${message}`, data);
};

// ================= AXIOS INSTANCE =================
const client = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...(AI_SERVICE_TOKEN ? { 'X-Service-Token': AI_SERVICE_TOKEN } : {}),
  },
});

// ================= REQUEST INTERCEPTOR =================
client.interceptors.request.use((config) => {
  if (isCircuitOpen()) {
    throw new Error('AI service temporarily unavailable (circuit breaker open)');
  }

  const requestId = uuid();
  config.headers['X-Request-ID'] = requestId;
  config.metadata = { startTime: Date.now(), requestId };

  log('log', `${config.method.toUpperCase()} ${config.url}`, { requestId });

  return config;
});

// ================= RESPONSE INTERCEPTOR =================
client.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;

    log('log', `Success ${response.config.url}`, {
      requestId: response.config.metadata.requestId,
      duration: `${duration}ms`,
    });

    resetCircuit();
    return response.data;
  },

  async (error) => {
    const config = error.config;
    const requestId = config?.metadata?.requestId || 'unknown';

    const isTimeout =
      error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');
    const isNetworkError = !error.response;
    const isRetryable = isNetworkError || isTimeout;

    // ================= RETRY =================
    config._retryCount = config._retryCount || 0;

    if (isRetryable && config._retryCount < MAX_RETRIES) {
      config._retryCount++;
      const delay = BASE_DELAY * 2 ** (config._retryCount - 1);

      log('warn', `Retry ${config._retryCount}/${MAX_RETRIES}`, { requestId, delay });
      await new Promise((r) => setTimeout(r, delay));

      return client(config);
    }

    // ================= ERROR HANDLING =================
    recordFailure();

    if (error.response) {
      const { status, data } = error.response;

      log('error', `Error ${status}`, {
        requestId,
        message: data?.detail || data?.error || error.message,
      });

      if (status === 401) throw new Error('AI service authentication failed. Check AI_SERVICE_TOKEN.');
      if (status === 429) { const e = new Error('AI service rate limited. Try again later.'); e.isRateLimit = true; throw e; }
      if (status === 503) throw new Error('AI service unavailable (possibly cold start)');
      if (status === 400) throw new Error(data?.detail || data?.error || 'Invalid request to AI service');
      if (status === 500) throw new Error('AI service internal error');
    }

    if (isNetworkError) {
      log('error', 'Network error', { requestId, message: error.message });
      throw new Error('Cannot reach AI service');
    }

    throw error;
  }
);

// ================= HELPERS =================

// JSON POST — used by all AI service files
async function post(endpoint, body) {
  return client.post(endpoint, body);
}

// Multipart form POST — used for file uploads
// transformRequest prevents axios from JSON-serializing FormData
// which strips the multipart boundary and sends binary instead
async function postForm(endpoint, form) {
  const formHeaders = form.getHeaders();
  return client.post(endpoint, form, {
    headers: {
      ...formHeaders,
      'Content-Type': formHeaders['content-type'],
    },
    transformRequest: [(data) => data],
  });
}

// ================= EXPORT =================
module.exports = { client, post, postForm, FormData };
