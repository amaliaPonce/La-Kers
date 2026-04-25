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
  const headers: any = config.headers ?? {};
  const canUseAxiosHeaders = typeof headers.set === 'function';

  if (canUseAxiosHeaders) {
    headers.set('x-la-kers-portal', 'tenant');
  } else {
    headers['x-la-kers-portal'] = 'tenant';
  }

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

  if (inviteToken) {
    if (canUseAxiosHeaders) {
      headers.set('x-la-kers-tenant-invite', inviteToken);
    } else {
      headers['x-la-kers-tenant-invite'] = inviteToken;
    }
  } else if (canUseAxiosHeaders) {
    headers.delete?.('x-la-kers-tenant-invite');
  } else {
    delete headers['x-la-kers-tenant-invite'];
  }

  config.headers = headers;
  return config;
});

export default tenantApiClient;
