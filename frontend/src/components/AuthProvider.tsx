'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// Syncs the Zustand token → a cookie so Next.js middleware can read it
// (middleware runs on edge and can't access localStorage)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) {
      // Write a simple presence cookie (not the actual token — just a flag)
      document.cookie = `edupilot_auth_token=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      // Re-validate token against the server on every app load
      fetchMe();
    } else {
      // Clear the cookie on logout
      document.cookie = 'edupilot_auth_token=; path=/; max-age=0';
    }
  }, [token, fetchMe]);

  return <>{children}</>;
}