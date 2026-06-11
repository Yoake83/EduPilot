'use client';

// Safe token getter — only runs on client, never on server
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('edupilot-auth') || '{}')?.state?.token ?? null;
  } catch {
    return null;
  }
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}