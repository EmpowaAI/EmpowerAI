import { API_BASE_URL } from '../../lib/apiBase';

const getToken = () => localStorage.getItem('empowerai-token');

export const getMyTwin = async () => {
  const res = await fetch(`${API_BASE_URL}/twin/`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

export const initTwinChat = async (): Promise<{ twinData: any }> => {
  const res = await fetch(`${API_BASE_URL}/twin/chat/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Init failed: ${res.status}`);
  return json.data;
};

export const chatWithTwin = async (
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  twinContext: any,
  isLastPrompt = false,
): Promise<{ reply: string; twinData?: any }> => {
  const res = await fetch(`${API_BASE_URL}/twin/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ message, history, twinContext, isLastPrompt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Chat failed: ${res.status}`);
  return json.data;
};

export const buildTwinFromCv = async (cvAnalysis: any) => {
  const res = await fetch(`${API_BASE_URL}/twin/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      cv_analysis: cvAnalysis
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to generate twin: ${res.status}`);
  }

  return res.json();
};