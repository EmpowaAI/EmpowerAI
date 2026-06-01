// ── CV Analyzer API ───────────────────────────────────────────────────────
// All requests go to the Node/Express backend.
// The frontend never knows an AI service exists.

import { API_BASE_URL } from '../../lib/apiBase';
import type { AnalyzeResponse, RevampResponse } from './types';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('empowerai-token');
  return {
    Authorization: `Bearer ${token ?? ''}`,
  };
}

// ── Analyse via file upload ────────────────────────────────────────────────
export async function analyzeCVFile(
  file: File,
  targetRole: string,
  industry: string,
  jobDescription?: string
): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append('cvFile', file);
  form.append('targetRole', targetRole);
  form.append('industry', industry);
  if (jobDescription) form.append('jobDescription', jobDescription);

  const res = await fetch(`${API_BASE_URL}/cv/analyze-file`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });

  return handleResponse<AnalyzeResponse>(res);
}

// ── Analyse via pasted text ────────────────────────────────────────────────
export async function analyzeCVText(
  cvText: string,
  targetRole: string,
  industry: string,
  jobDescription?: string
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/analyze`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvText, targetRole, industry, jobDescription }),
  });

  return handleResponse<AnalyzeResponse>(res);
}

// ── Revamp CV (subscription-gated on the backend) ─────────────────────────
export async function revampCV(
  cvText: string,
  analysis: unknown,
  targetRole: string,
  industry: string
): Promise<RevampResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/revamp`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv_text: cvText, analysis, target_role: targetRole, industry }),
  });

  return handleResponse<RevampResponse>(res);
}

// ── Restore cached analysis to backend profile ────────────────────────────
export async function restoreFromCache(analysis: unknown): Promise<{ profileId: string }> {
  const res = await fetch(`${API_BASE_URL}/cv/restore-from-cache`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis }),
  });

  const json = await handleResponse<{ data: { profileId: string } }>(res);
  return { profileId: json.data.profileId };
}

// ── Get existing CV profile ────────────────────────────────────────────────
export async function getCVProfile(): Promise<{ profile: unknown | null }> {
  const res = await fetch(`${API_BASE_URL}/cv/profile`, {
    headers: authHeaders(),
  });

  const json = await handleResponse<{ profile: unknown | null }>(res);
  return { profile: json.profile ?? null };
}

// ── Delete CV profile ──────────────────────────────────────────────────────
export async function deleteCVProfile(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cv/profile`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  await handleResponse<unknown>(res);
}

// ── Shared response handler ────────────────────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  let body: unknown;

  try {
    body = await res.json();
  } catch {
    throw new Error(`Server returned ${res.status} with no JSON body.`);
  }

  if (!res.ok) {
    const data = body as Record<string, unknown>;
    const message =
      (data?.message as string) ||
      (data?.error as string) ||
      `Request failed with status ${res.status}`;

    const err = Object.assign(new Error(message), {
      status: res.status,
      limitReached: !!(data?.limitReached),
      requiresSubscription: !!(data?.requiresSubscription),
      isRateLimit: res.status === 429,
      retryAfter: (data?.retryAfter as number) ?? undefined,
    });

    throw err;
  }

  // Node wraps successful responses in { status: 'success', data: { ... } }
  const wrapper = body as { status: string; data?: T } & T;
  return (wrapper.data ?? wrapper) as T;
}
