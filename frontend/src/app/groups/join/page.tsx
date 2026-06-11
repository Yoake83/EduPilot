'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function getToken() {
  try { return JSON.parse(localStorage.getItem('edupilot-auth') || '{}')?.state?.token; } catch { return null; }
}

export default function JoinGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { setError('Please enter a join code.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/groups/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ joinCode: code.trim().toUpperCase(), studentName: user?.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join group');
      router.push(`/groups/${data.group._id}`);
    } catch (err: any) {
      setError(err.message); setLoading(false);
    }
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ height: 60, background: '#fff', borderBottom: '0.5px solid #E5E0D5', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Link href="/groups" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Groups</Link>
        <span style={{ fontSize: 13, color: '#E5E0D5' }}>/</span>
        <span style={{ fontSize: 13, color: '#111' }}>Join Class</span>
      </div>

      <div style={{ maxWidth: 440, margin: '64px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 6px' }}>Join a Class</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Ask your teacher for the class code and enter it below.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #E5E0D5', padding: 28 }}>
          <form onSubmit={handleJoin}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Class Code</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD"
                maxLength={6}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 10,
                  border: '2px solid #E5E0D5', fontSize: 22, fontWeight: 700,
                  textAlign: 'center', letterSpacing: '6px', outline: 'none',
                  background: '#FAFAF8', color: '#0A4A3C', boxSizing: 'border-box' as const,
                }}
              />
              <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: '6px 0 0' }}>6-character code from your teacher</p>
            </div>
            <button type="submit" disabled={loading || code.length < 6} style={{
              width: '100%', padding: '11px 0', borderRadius: 10,
              background: loading || code.length < 6 ? '#9CA3AF' : '#0A4A3C',
              color: '#F2B759', fontSize: 14, fontWeight: 700,
              border: 'none', cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Joining…' : 'Join Class'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}