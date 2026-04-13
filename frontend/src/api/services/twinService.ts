import axios from 'axios';
import { API_BASE_URL } from '../Client';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('empowerai-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export const buildTwinFromCv = async () => {
  try {
    const res = await api.post('/twin/build-from-cv');
    return res.data;
  } catch (error: any) {
    console.error('Build twin error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMyTwin = async () => {
  try {
    const res = await api.get('/my-twin');
    return res.data;
  } catch (error: any) {
    console.error('Get twin error:', error.response?.data || error.message);
    throw error;
  }
};

export const chatWithTwin = async (messages: ChatMsg[], cvContext?: any) => {
  try {
    const payload: any = { messages };
    if (cvContext) {
      payload.cv_context = cvContext;
    }
    const res = await api.post('/chat/twin', payload);
    return res.data;
  } catch (error: any) {
    console.error('Chat error:', error.response?.data || error.message);
    throw error;
  }
};

export const runSimulation = async (pathIds?: string[]) => {
  try {
    const res = await api.post('/twin/simulate', { pathIds });
    return res.data;
  } catch (error: any) {
    console.error('Simulation error:', error.response?.data || error.message);
    throw error;
  }
};

