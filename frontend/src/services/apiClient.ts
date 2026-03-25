import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
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

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('la-kers-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hasStoredToken = Boolean(localStorage.getItem('la-kers-token'));

    if (status === 401 && hasStoredToken) {
      localStorage.removeItem('la-kers-token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
