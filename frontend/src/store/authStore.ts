import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  _id: string;  
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  fetchMe: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isLoading: false,
        error: null,

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const res = await fetch(`${API}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
              set({ error: data.error || 'Login failed', isLoading: false });
              return false;
            }
            set({ user: data.user, token: data.token, isLoading: false });
            return true;
          } catch {
            set({ error: 'Network error — is the server running?', isLoading: false });
            return false;
          }
        },

        register: async (formData) => {
          set({ isLoading: true, error: null });
          try {
            const res = await fetch(`${API}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
              set({ error: data.error || 'Registration failed', isLoading: false });
              return false;
            }
            set({ user: data.user, token: data.token, isLoading: false });
            return true;
          } catch {
            set({ error: 'Network error — is the server running?', isLoading: false });
            return false;
          }
        },

        logout: () => {
          set({ user: null, token: null, error: null });
        },

        clearError: () => set({ error: null }),

        fetchMe: async () => {
          const { token } = get();
          if (!token) return;
          try {
            const res = await fetch(`${API}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
              // Token expired — clear everything
              set({ user: null, token: null });
              return;
            }
            const data = await res.json();
            set({ user: data.user });
          } catch {
            // silently fail — user stays logged in with cached data
          }
        },
      }),
      {
        name: 'edupilot-auth', // localStorage key
        partialize: (state) => ({ token: state.token, user: state.user }),
      }
    )
  )
);