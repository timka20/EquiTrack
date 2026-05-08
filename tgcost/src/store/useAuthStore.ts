import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/services/api';

export type UserRole = 'advertiser' | 'owner' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  company?: string;
  status?: UserStatus;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; name: string; role: UserRole }) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  updateAvatar: (avatar: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login(email, password);
          localStorage.setItem('tgcost_token', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } catch (error: any) {
          set({
            error: error.message || 'Ошибка входа',
            isLoading: false
          });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.register(data);
          localStorage.setItem('tgcost_token', response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } catch (error: any) {
          set({
            error: error.message || 'Ошибка регистрации',
            isLoading: false
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('tgcost_token');
        localStorage.removeItem('tgcost-auth');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      loadUser: async () => {
        const token = localStorage.getItem('tgcost_token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const user = await api.getProfile();
          set({ user, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('tgcost_token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateUser: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.updateProfile(updates);
          set((state) => ({
            user: state.user ? { ...state.user, ...response.user } : null,
            isLoading: false
          }));
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      updateAvatar: async (avatar: string) => {
        return get().updateUser({ avatar });
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.changePassword(currentPassword, newPassword);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'tgcost-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
