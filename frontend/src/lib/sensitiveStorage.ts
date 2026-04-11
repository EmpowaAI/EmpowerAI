const SESSION_CV_ANALYSIS_KEY = 'empowerai:cvAnalysis';
const SESSION_CV_FILENAME_KEY = 'empowerai:cvFileName';

const LEGACY_CV_ANALYSIS_KEYS = ['comprehensiveCVAnalysis', 'cvAnalysisData'];
const LEGACY_CV_FILENAME_KEY = 'cvFileName';

const safeJsonParse = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export function getStoredCvAnalysis<T = any>(): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionValue = safeJsonParse<T>(window.sessionStorage?.getItem(SESSION_CV_ANALYSIS_KEY));
    if (sessionValue) return sessionValue;
  } catch {
    // ignore
  }

  try {
    for (const key of LEGACY_CV_ANALYSIS_KEYS) {
      const parsed = safeJsonParse<T>(window.localStorage?.getItem(key));
      if (parsed) return parsed;
    }
  } catch {
    // ignore
  }

  return null;
}

export function setStoredCvAnalysis(value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage?.setItem(SESSION_CV_ANALYSIS_KEY, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function clearStoredCvAnalysis(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage?.removeItem(SESSION_CV_ANALYSIS_KEY);
  } catch {
    // ignore
  }
  try {
    for (const key of LEGACY_CV_ANALYSIS_KEYS) {
      window.localStorage?.removeItem(key);
    }
  } catch {
    // ignore
  }
}

export function getStoredCvFileName(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionName = window.sessionStorage?.getItem(SESSION_CV_FILENAME_KEY);
    if (sessionName) return sessionName;
  } catch {
    // ignore
  }
  try {
    return window.localStorage?.getItem(LEGACY_CV_FILENAME_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredCvFileName(name: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (name) window.sessionStorage?.setItem(SESSION_CV_FILENAME_KEY, name);
    else window.sessionStorage?.removeItem(SESSION_CV_FILENAME_KEY);
  } catch {
    // ignore
  }
}

export function clearStoredCvFileName(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage?.removeItem(SESSION_CV_FILENAME_KEY);
  } catch {
    // ignore
  }
  try {
    window.localStorage?.removeItem(LEGACY_CV_FILENAME_KEY);
  } catch {
    // ignore
  }
}

