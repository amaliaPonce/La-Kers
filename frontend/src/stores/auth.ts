import { defineStore } from 'pinia';
import apiClient from '../services/apiClient';

export type AuthUser = {
  id: string;
  email?: string | null;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('la-kers-token') ?? '',
    user: null as AuthUser | null,
    status: 'idle' as 'idle' | 'loading' | 'failed'
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    setToken(token: string | '') {
      this.token = token;
      if (token) {
        localStorage.setItem('la-kers-token', token);
      } else {
        localStorage.removeItem('la-kers-token');
      }
    },
    setUser(user: AuthUser | null) {
      this.user = user;
    },
    async login(payload: { email: string; password: string }) {
      this.status = 'loading';
      try {
        const { data } = await apiClient.post('/auth/login', payload);
        const session = data.session;
        if (!session) {
          throw new Error('No session returned');
        }
        this.setToken(session.access_token);
        this.setUser({ id: data.user.id, email: data.user.email });
        this.status = 'idle';
      } catch (error) {
        this.status = 'failed';
        throw error;
      }
    },
    logout() {
      this.setToken('');
      this.setUser(null);
      this.status = 'idle';
    }
  }
});
