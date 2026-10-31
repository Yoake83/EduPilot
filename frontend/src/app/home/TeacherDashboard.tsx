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
    <div className="dashboard-page" style={{ ...s, background: '#F7F5EF', minHeight: '100vh' }}>
      <Topbar title="Dashboard" action={{ label: '✦ Create Assignment', href: '/assignments/create' }} />

      <div className="dashboard-content">
        <section className="welcome-panel reveal"><div className="welcome-copy"><span className="eyebrow">YOUR LEARNING SPACE</span><p className="welcome-greeting">Welcome back, {user?.name?.split(' ')[0] || 'there'}</p><h1>A good day to inspire.</h1><p>A clear view of your classes. More space for what matters.</p><Link className="button button-primary" href="/assignments/create">Create something inspiring <span aria-hidden="true">↗</span></Link></div><div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-spark">✦</div><div className="art-card"><span>Small steps.</span><strong>Bright futures.</strong><div className="art-lines"><i/><i/><i/></div></div><span className="art-dot"/></div></section>

        {/* Stats */}
        <div className="dashboard-stats reveal">
          {[
            { label: 'My Groups', value: groups.length, sub: 'active classes', link: '/groups' },
            { label: 'Total Students', value: totalStudents, sub: 'across all groups', link: '/groups' },
            { label: 'Assignments', value: assignments.length, sub: `${completed} completed`, link: '/assignments' },
          ].map(({ label, value, sub, link }) => (
            <Link key={label} href={link} style={{ textDecoration: 'none' }}>
              <div className="stat-card">
                <p style={{ fontSize: 12, color: '#69758A', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#315ED8', margin: '0 0 2px' }}>{loading ? '—' : value}</p>
                <p style={{ fontSize: 12, color: '#315ED8', margin: 0, fontWeight: 600 }}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Groups */}
        <div className="dashboard-section reveal" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111', margin: 0 }}>My Groups</h2>
            <Link href="/groups" style={{ fontSize: 12, color: '#315ED8', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p> :
            groups.length === 0 ? (
              <div className="interactive-card" style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E2E5EC', padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px' }}>No groups yet. Create your first class!</p>
                <Link href="/groups/create" style={{ display: 'inline-block', padding: '8px 18px', background: '#315ED8', color: '#FFFFFF', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>+ Create Group</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {groups.slice(0, 4).map((g) => (
                  <Link key={g._id} href={`/groups/${g._id}`} style={{ textDecoration: 'none' }}>
                    <div className="interactive-card" style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E2E5EC', padding: '14px 16px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(49,94,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>📚</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 8px' }}>{g.subject}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>{g.students.length} students</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(49,94,216,0.08)', color: '#315ED8' }}>{g.joinCode}</span>
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
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111', margin: 0 }}>Recent Assignments</h2>
            <Link href="/assignments" style={{ fontSize: 12, color: '#315ED8', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p> :
            assignments.length === 0 ? (
              <div className="interactive-card" style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E2E5EC', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>No assignments yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {assignments.slice(0, 5).map((a) => {
                  const statusColor: Record<string, string> = { completed: '#315ED8', pending: '#92651a', processing: '#1D4ED8', failed: '#DC2626' };
                  const statusBg: Record<string, string> = { completed: 'rgba(49,94,216,0.08)', pending: 'rgba(49,94,216,0.15)', processing: '#EFF6FF', failed: '#FEF2F2' };
                  return (
                    <Link key={a._id} href={`/assignments/${a._id}`} style={{ textDecoration: 'none' }}>
                      <div className="assignment-row interactive-card" style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #E2E5EC', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(49,94,216,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 14 }}>📄</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                          <p style={{ fontSize: 12, color: '#69758A', margin: '2px 0 0' }}>{a.groupId?.name || 'No group'} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: statusBg[a.status] || '#F3F4F6', color: statusColor[a.status] || '#6B7280', textTransform: 'capitalize' as const, flexShrink: 0 }}>
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