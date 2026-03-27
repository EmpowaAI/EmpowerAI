const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

export const normalizeApiBase = (value: string): string => {
  const trimmed = String(value || '').trim();
  const withoutTrailingSlashes = trimmed.replace(/\/+$/, '');

  // If config already includes an `/api` path segment, keep as-is.
  // Examples:
  // - https://example.com/api
  // - https://example.com/api/v1
  // - /api
  if (/\/api(\/|$)/.test(withoutTrailingSlashes)) return withoutTrailingSlashes;

  // Otherwise, assume the provided value is the backend origin and append `/api`.
  return `${withoutTrailingSlashes}/api`;
};

export const API_BASE_URL = normalizeApiBase(RAW_API_BASE);

