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
  const headers: any = config.headers ?? {};
  const canUseAxiosHeaders = typeof headers.set === 'function';

  if (token) {
    if (canUseAxiosHeaders) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers.Authorization = `Bearer ${token}`;
    }
  } else if (canUseAxiosHeaders) {
    headers.delete?.('Authorization');
  } else {
    delete headers.Authorization;
  }

  config.headers = headers;

  return config;
});

export default apiClient;
