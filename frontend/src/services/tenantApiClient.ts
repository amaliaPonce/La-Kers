import axios from 'axios';
import { getClerkSessionToken } from './clerkSession';
import { getTenantPortalInviteToken } from './tenantPortalInvite';

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

tenantApiClient.interceptors.request.use(async (config) => {
  const token = await getClerkSessionToken();
  const inviteToken = getTenantPortalInviteToken();
  config.headers.set('x-la-kers-portal', 'tenant');

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    config.headers.delete?.('Authorization');
  }

  if (inviteToken) {
    config.headers.set('x-la-kers-tenant-invite', inviteToken);
  } else {
    config.headers.delete?.('x-la-kers-tenant-invite');
  }

  return config;
});

export default tenantApiClient;
