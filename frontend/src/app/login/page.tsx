'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#F2B759' }}>E</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Sign in to EduPilot</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #E5E0D5', padding: 28 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }} />
            </div>
            <button type="submit" disabled={isLoading} style={{
              width: '100%', padding: '11px 0', borderRadius: 10,
              background: isLoading ? '#9CA3AF' : '#0A4A3C',
              color: '#F2B759', fontSize: 14, fontWeight: 700, border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20, marginBottom: 0 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#0A4A3C', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}