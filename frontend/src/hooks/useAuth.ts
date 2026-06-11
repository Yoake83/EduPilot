'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const router = useRouter();
  const { user, token, logout: storeLogout, isLoading } = useAuthStore();

  function logout() {
    storeLogout();
    // Cookie gets cleared by AuthProvider's useEffect watching token
    router.push('/login');
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    logout,
    isStudent: user?.role === 'student',
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
  };
}