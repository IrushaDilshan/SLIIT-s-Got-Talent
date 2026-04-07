import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your machine's local IP address instead of localhost for physical devices/emulators
// Expo host IPv4: 172.20.10.5
const API_BASE_URL = 'http://172.20.10.5:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const authAPI = {
  login: (email) => api.post('/auth/login', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify', { email, otp }),
};

export const contestantsAPI = {
  getAll: () => api.get('/contestants'),
};

export const votesAPI = {
  castVote: (contestantId) => api.post('/votes', { contestantId }),
  getStats: () => api.get('/votes/stats'),
};

export const timerAPI = {
  getServerTime: () => api.get('/timer/server-time'),
  getEventStatus: () => api.get('/timer/event-status'),
};

export const settingsAPI = {
  getSettings: () => api.get('/settings'),
};

export default api;
