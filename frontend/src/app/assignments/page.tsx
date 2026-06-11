'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { format } from 'date-fns';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dueDate: string;
  createdAt: string;
  groupId?: { name: string; subject: string; teacherName?: string };
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    setIsLoading(true);
    fetch(`${API}/api/assignments`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setAssignments(d.assignments || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [mounted]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment?')) return;
    await fetch(`${API}/api/assignments/${id}`, { method: 'DELETE', headers: authHeaders() });
    setAssignments(prev => prev.filter(a => a._id !== id));
    setMenuOpenId(null);
  }

  const filtered = (assignments || []).filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' ? true : a.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const statusColors: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(10,74,60,0.08)', color: '#0A4A3C' },
    pending: { bg: 'rgba(242,183,89,0.15)', color: '#92651a' },
    processing: { bg: '#EFF6FF', color: '#1D4ED8' },
    failed: { bg: '#FEF2F2', color: '#DC2626' },
  };

  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  return (
    <div style={{ ...s, minHeight: '100vh', background: '#F5F0E8' }}>
      {/* Topbar */}
      <div style={{ height: 60, background: '#fff', borderBottom: '0.5px solid #E5E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30 }}>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>Assignments</span>
        {isTeacher && (
          <Link href="/assignments/create" style={{ padding: '7px 16px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            + Create Assignment
          </Link>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>Assignments</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>
          {isTeacher ? 'Manage and create assignments for your classes.' : 'Your assignments from all enrolled classes.'}
        </p>

        {/* Search + Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assignments…"
            style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: '0.5px solid #E5E0D5', fontSize: 13, outline: 'none', background: '#fff' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'completed', 'pending', 'failed'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: '0.5px solid', cursor: 'pointer', textTransform: 'capitalize' as const,
                background: activeFilter === f ? '#0A4A3C' : '#fff',
                color: activeFilter === f ? '#F2B759' : '#6B7280',
                borderColor: activeFilter === f ? '#0A4A3C' : '#E5E0D5',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #F2B759', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>
              {assignments.length === 0 ? 'No assignments yet' : 'No results found'}
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>
              {isTeacher
                ? 'Create your first assignment to get started.'
                : 'Join a class to see assignments here.'}
            </p>
            {isTeacher && (
              <Link href="/assignments/create" style={{ display: 'inline-block', padding: '9px 20px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                + Create Assignment
              </Link>
            )}
          </div>
        ) : (
          <div ref={menuRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
            {filtered.map((a) => {
              const sc = statusColors[a.status] || { bg: '#F3F4F6', color: '#6B7280' };
              return (
                <div key={a._id} style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '18px 20px', position: 'relative' }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0, flex: 1, paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title}
                    </p>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        onMouseDown={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === a._id ? null : a._id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 20, padding: '0 4px', lineHeight: 1 }}
                      >⋮</button>
                      {menuOpenId === a._id && (
                        <div style={{ position: 'absolute', right: 0, top: 28, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 160, overflow: 'hidden', border: '0.5px solid #E5E0D5' }}>
                          <button
                            onMouseDown={e => { e.stopPropagation(); setMenuOpenId(null); router.push(`/assignments/${a._id}`); }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#111', background: 'none', border: 'none', cursor: 'pointer' }}
                          >View</button>
                          {isTeacher && (
                            <>
                              <div style={{ height: 1, background: '#F0EDE8', margin: '0 12px' }} />
                              <button
                                onMouseDown={e => { e.stopPropagation(); router.push(`/assignments/review/${a._id}`); setMenuOpenId(null); }}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#0A4A3C', background: 'none', border: 'none', cursor: 'pointer' }}
                              >Submissions</button>
                            </>
                          )}
                          {!isTeacher && (
                            <>
                              <div style={{ height: 1, background: '#F0EDE8', margin: '0 12px' }} />
                              <button
                                onMouseDown={e => { e.stopPropagation(); router.push(`/assignments/submit/${a._id}`); setMenuOpenId(null); }}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#0A4A3C', background: 'none', border: 'none', cursor: 'pointer' }}
                              >Submit</button>
                            </>
                          )}
                          {isTeacher && (
                            <>
                              <div style={{ height: 1, background: '#F0EDE8', margin: '0 12px' }} />
                              <button
                                onMouseDown={e => { e.stopPropagation(); handleDelete(a._id); }}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}
                              >Delete</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group + subject */}
                  {a.groupId && (
                    <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 10px' }}>
                      📚 {a.groupId.name} · {a.subject}
                    </p>
                  )}

                  {/* Dates row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>Assigned: </span>
                      {format(new Date(a.createdAt), 'dd MMM yyyy')}
                      <span style={{ margin: '0 8px', color: '#E5E0D5' }}>·</span>
                      <span style={{ fontWeight: 600, color: '#374151' }}>Due: </span>
                      {format(new Date(a.dueDate), 'dd MMM yyyy')}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: sc.bg, color: sc.color, textTransform: 'capitalize' as const }}>
                      {a.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}