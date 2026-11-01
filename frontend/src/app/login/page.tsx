'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { if (user) router.replace('/home'); }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    const ok = await login(email, password);
    if (ok) router.push('/home');
  }

  return (
    <AuthShell mode="login">
      <div className="auth-form-heading"><span className="auth-step">YOUR LEARNING SPACE</span><h2>Welcome back.</h2><p>A fresh day. A world of possibilities.</p></div>
      <div className="auth-form-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
              <input aria-label="Email" autoComplete="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E5EC', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <input aria-label="Password" autoComplete="current-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E5EC', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }} />
            </div>
            <button type="submit" disabled={isLoading} style={{
              width: '100%', padding: '11px 0', borderRadius: 10,
              background: isLoading ? '#9CA3AF' : '#315ED8',
              color: '#FFFFFF', fontSize: 14, fontWeight: 700, border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginTop: 20, marginBottom: 0 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#315ED8', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
    </AuthShell>
  );
}