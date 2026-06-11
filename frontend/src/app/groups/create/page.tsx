'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function getToken() {
  try { return JSON.parse(localStorage.getItem('edupilot-auth') || '{}')?.state?.token; } catch { return null; }
}

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !subject) { setError('Name and subject are required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, subject, description, teacherName: user?.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');
      router.push(`/groups/${data.group._id}`);
    } catch (err: any) {
      setError(err.message); setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #E5E0D5', fontSize: 13, outline: 'none',
    background: '#FAFAF8', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ height: 60, background: '#fff', borderBottom: '0.5px solid #E5E0D5', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Link href="/groups" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Groups</Link>
        <span style={{ fontSize: 13, color: '#E5E0D5' }}>/</span>
        <span style={{ fontSize: 13, color: '#111' }}>Create Class</span>
      </div>

      <div style={{ maxWidth: 500, margin: '48px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>Create a Class</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 28px' }}>Students will join using the code generated automatically.</p>

        <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #E5E0D5', padding: 28 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Class Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grade 10 — Physics" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Physics" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Description <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of this class…" rows={3}
                style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px 0', borderRadius: 10,
              background: loading ? '#9CA3AF' : '#0A4A3C',
              color: '#F2B759', fontSize: 14, fontWeight: 700,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Creating…' : 'Create Class'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}