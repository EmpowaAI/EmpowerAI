import axios from 'axios';
import { API_BASE_URL } from '../Client';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Chat message shape matching the backend controller expectation
export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

// Build Twin from CV profile
export const buildTwinFromCv = async () => {
  try {
    const res = await api.post('/twin/build-from-cv');
    return res.data;
  } catch (error: any) {
    console.error('Build twin error:', error.response?.data || error.message);
    throw error;
  }
};

// GET /my-twin — returns { status, data: { twin } }
export const getMyTwin = async () => {
  try {
    const res = await api.get('twin/twin');
    return res.data;
  } catch (error: any) {
    console.error('Get twin error:', error.response?.data || error.message);
    throw error;
  }
};

// POST /chat/twin — sends full messages array (not a single string)
// Backend controller expects: { messages: ChatMsg[] }
export const chatWithTwin = async (messages: ChatMsg[]) => {
  try {
    const res = await api.post('/chat/twin', { messages });
    return res.data;
  } catch (error: any) {
    console.error('Chat error:', error.response?.data || error.message);
    throw error;
  }
};

// POST /twin/simulate
export const runSimulation = async (pathIds?: string[]) => {
  try {
    const res = await api.post('/twin/simulate', { pathIds });
    return res.data;
  } catch (error: any) {
    console.error('Simulation error:', error.response?.data || error.message);
    throw error;
  }
};
