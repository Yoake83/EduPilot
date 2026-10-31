'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Group { _id: string; name: string; subject: string; teacherName: string; students: any[]; }
interface Assignment { _id: string; title: string; subject: string; status: string; dueDate: string; groupId?: { name: string; teacherName: string }; }

export default function StudentDashboard() {
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

  const upcoming = assignments.filter(a => new Date(a.dueDate) >= new Date());
  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  return (
    <div className="dashboard-page" style={{ ...s, background: '#F7F5EF', minHeight: '100vh' }}>
      <Topbar title="Dashboard" action={{ label: '+ Join a Class', href: '/groups/join' }} />

      <div className="dashboard-content">
        <section className="welcome-panel reveal"><div className="welcome-copy"><span className="eyebrow">YOUR LEARNING SPACE</span><p className="welcome-greeting">Welcome back, {user?.name?.split(' ')[0] || 'there'}</p><h1>A little progress, every day.</h1><p>Your classes, your questions, your next big idea. All right here.</p><Link className="button button-primary" href="/study">Explore study assistant <span aria-hidden="true">↗</span></Link></div><div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-spark">✦</div><div className="art-card"><span>Small steps.</span><strong>Bright futures.</strong><div className="art-lines"><i/><i/><i/></div></div><span className="art-dot"/></div></section>

        {/* Stats */}
        <div className="dashboard-stats reveal">
          {[
            { label: 'Enrolled Classes', value: groups.length, sub: 'active groups' },
            { label: 'Total Assignments', value: assignments.length, sub: 'across all classes' },
            { label: 'Upcoming', value: upcoming.length, sub: 'due soon' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="stat-card">
              <p style={{ fontSize: 12, color: '#69758A', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#315ED8', margin: '0 0 2px' }}>{loading ? '—' : value}</p>
              <p style={{ fontSize: 12, color: '#315ED8', margin: 0, fontWeight: 600 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* My Classes */}
        <div className="dashboard-section reveal" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111', margin: 0 }}>My Classes</h2>
            <Link href="/groups" style={{ fontSize: 12, color: '#315ED8', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p> :
            groups.length === 0 ? (
              <div className="interactive-card" style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E2E5EC', padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px' }}>You haven&apos;t joined any classes yet.</p>
                <Link href="/groups/join" style={{ display: 'inline-block', padding: '8px 18px', background: '#315ED8', color: '#FFFFFF', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Join a Class</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {groups.map((g) => (
                  <Link key={g._id} href={`/groups/${g._id}`} style={{ textDecoration: 'none' }}>
                    <div className="interactive-card" style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E2E5EC', padding: '14px 16px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(49,94,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>📚</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px' }}>{g.subject}</p>
                      <p style={{ fontSize: 12, color: '#69758A', margin: 0 }}>by {g.teacherName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </div>

        {/* Assignments */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111', margin: 0 }}>Assignments</h2>
            <Link href="/assignments" style={{ fontSize: 12, color: '#315ED8', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p> :
            assignments.length === 0 ? (
              <div className="interactive-card" style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E2E5EC', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>No assignments yet — join a class to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {assignments.slice(0, 6).map((a) => {
                  const isOverdue = new Date(a.dueDate) < new Date();
                  return (
                    <div key={a._id} style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #E2E5EC', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(49,94,216,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 14 }}>📄</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                        <p style={{ fontSize: 12, color: '#69758A', margin: '2px 0 0' }}>{a.groupId?.name || a.subject} · {a.groupId?.teacherName}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: isOverdue ? '#DC2626' : '#6B7280' }}>
                          {isOverdue ? '⚠ Overdue' : `Due ${new Date(a.dueDate).toLocaleDateString()}`}
                        </span>
                        <Link href={`/assignments/submit/${a._id}`} style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#315ED8', color: '#FFFFFF', textDecoration: 'none' }}>
                          Submit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}