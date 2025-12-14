import { create } from 'zustand';
import { authService } from '../services';

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (credentials) => {
    const data = await authService.login(credentials);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  register: async (userData) => {
    const data = await authService.register(userData);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
