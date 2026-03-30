import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const tenantApiClient = axios.create({
  baseURL: `${API_BASE.replace(/\/$/, '')}/tenant-portal`,
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

export default tenantApiClient;
