import axios from 'axios';
import { getClerkSessionToken } from './clerkSession';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  transformResponse: [
    (data) => {
      if (!data) {
        return {};
      }
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
  ]
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getClerkSessionToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    config.headers.delete?.('Authorization');
  }

  return config;
});

export default apiClient;
