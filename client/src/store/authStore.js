import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/authApi';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── STATE ────────────────────────────────
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ─── ACTIONS ──────────────────────────────
      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken } = await authApi.register(credentials);
          localStorage.setItem('accessToken', accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.error || 'Registration failed';
          const details = err.response?.data?.details || null;
          set({ error: message, isLoading: false });
          return { success: false, error: message, details };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken } = await authApi.login(credentials);
          localStorage.setItem('accessToken', accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.error || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (err) {
          // Even if API fails, still clear local state
        }
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false, error: null });
      },

      // Restore user from token on app startup
      restoreSession: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const { user } = await authApi.getMe();
          set({ user, isAuthenticated: true });
        } catch (err) {
          localStorage.removeItem('accessToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'wanderlist-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;