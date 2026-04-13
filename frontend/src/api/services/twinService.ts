import { API_BASE_URL } from '../../lib/apiBase';

const getToken = () => localStorage.getItem('empowerai-token');

export const getMyTwin = async () => {
  const res = await fetch(`${API_BASE_URL}/twin/my-twin`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

export const chatWithTwin = async (messages: any[], cv_context: any) => {
  const res = await fetch(`${API_BASE_URL}/chat/twin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      messages,
      cv_context,
      focus: localStorage.getItem('careerFocus') || 'growth'
    })
  });
  return res.json();
};