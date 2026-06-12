'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Group { _id: string; name: string; subject: string; joinCode: string; students: any[]; }
interface Assignment { _id: string; title: string; subject: string; status: string; dueDate: string; groupId?: { name: string }; }

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const headers = authHeaders();
    Promise.all([
      fetch(`${API}/api/groups`, { headers }).then(r => r.json()),
      fetch(`${API}/api/assignments`, { headers }).then(r => r.json()),
    ]).then(([gData, aData]) => {
      setGroups(gData.groups || []);
      setAssignments(aData.assignments || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [mounted]);

  const totalStudents = groups.reduce((sum, g) => sum + g.students.length, 0);
  const completed = assignments.filter(a => a.status === 'completed').length;
  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  return (
    <div style={{ ...s, background: '#F5F0E8', minHeight: '100vh' }}>
      <Topbar title="Dashboard" action={{ label: '✦ Create Assignment', href: '/assignments/create' }} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px' }}>Here&apos;s what&apos;s happening in your classes today.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'My Groups', value: groups.length, sub: 'active classes', link: '/groups' },
            { label: 'Total Students', value: totalStudents, sub: 'across all groups', link: '/groups' },
            { label: 'Assignments', value: assignments.length, sub: `${completed} completed`, link: '/assignments' },
          ].map(({ label, value, sub, link }) => (
            <Link key={label} href={link} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '0.5px solid #E5E0D5' }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#0A4A3C', margin: '0 0 2px' }}>{loading ? '—' : value}</p>
                <p style={{ fontSize: 11, color: '#F2B759', margin: 0, fontWeight: 600 }}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Groups */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>My Groups</h2>
            <Link href="/groups" style={{ fontSize: 12, color: '#0A4A3C', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p> :
            groups.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E5E0D5', padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px' }}>No groups yet. Create your first class!</p>
                <Link href="/groups/create" style={{ display: 'inline-block', padding: '8px 18px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>+ Create Group</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {groups.slice(0, 4).map((g) => (
                  <Link key={g._id} href={`/groups/${g._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E5E0D5', padding: '14px 16px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(10,74,60,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>📚</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 8px' }}>{g.subject}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{g.students.length} students</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(10,74,60,0.08)', color: '#0A4A3C' }}>{g.joinCode}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </div>

        {/* Recent Assignments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Recent Assignments</h2>
            <Link href="/assignments" style={{ fontSize: 12, color: '#0A4A3C', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p> :
            assignments.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E5E0D5', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>No assignments yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {assignments.slice(0, 5).map((a) => {
                  const statusColor: Record<string, string> = { completed: '#0A4A3C', pending: '#92651a', processing: '#1D4ED8', failed: '#DC2626' };
                  const statusBg: Record<string, string> = { completed: 'rgba(10,74,60,0.08)', pending: 'rgba(242,183,89,0.15)', processing: '#EFF6FF', failed: '#FEF2F2' };
                  return (
                    <Link key={a._id} href={`/assignments/${a._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #E5E0D5', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(10,74,60,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 14 }}>📄</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                          <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{a.groupId?.name || 'No group'} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: statusBg[a.status] || '#F3F4F6', color: statusColor[a.status] || '#6B7280', textTransform: 'capitalize' as const, flexShrink: 0 }}>
                          {a.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}