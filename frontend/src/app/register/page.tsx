'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, type UserRole } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, user } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('');

  useEffect(() => { if (user) router.replace('/home'); }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    const ok = await register({ name, email, password, role, department });
    if (ok) router.push('/home');
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', padding: '32px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#F2B759' }}>E</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>Create account</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Join EduPilot today</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #E5E0D5', padding: 28 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Full name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inputStyle} />
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>I am a…</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} style={{
                    padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid', textTransform: 'capitalize',
                    background: role === r ? '#0A4A3C' : '#fff',
                    color: role === r ? '#F2B759' : '#6B7280',
                    borderColor: role === r ? '#0A4A3C' : '#E5E0D5',
                  }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Department <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
              </label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" style={inputStyle} />
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: '100%', padding: '11px 0', borderRadius: 10,
              background: isLoading ? '#9CA3AF' : '#0A4A3C',
              color: '#F2B759', fontSize: 14, fontWeight: 700, border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 20, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#0A4A3C', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}