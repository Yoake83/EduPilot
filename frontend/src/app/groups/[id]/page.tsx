'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Student { userId: string; name: string; email: string; joinedAt: string; }
interface Group { _id: string; name: string; subject: string; description?: string; teacherId: string; teacherName: string; joinCode: string; students: Student[]; }
interface Assignment { _id: string; title: string; status: string; dueDate: string; }

export default function GroupDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'assignments' | 'students'>('assignments');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/api/groups/${id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setGroup(d.group); setAssignments(d.assignments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mounted, id]);

  async function handleRemoveStudent(studentId: string) {
    if (!confirm('Remove this student from the class?')) return;
    const res = await fetch(`${API}/api/groups/${id}/students/${studentId}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setGroup(data.group);
  }

  async function handleLeave() {
    if (!confirm('Leave this class?')) return;
    await fetch(`${API}/api/groups/leave/${id}`, { method: 'DELETE', headers: authHeaders() });
    router.push('/groups');
  }

  async function handleDelete() {
    if (!confirm('Delete this class? This cannot be undone.')) return;
    await fetch(`${API}/api/groups/${id}`, { method: 'DELETE', headers: authHeaders() });
    router.push('/groups');
  }

  function copyCode() {
    if (group) { navigator.clipboard.writeText(group.joinCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  if (loading) return (
    <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F0E8' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #F2B759', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!group) return (
    <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F0E8' }}>
      <p style={{ color: '#6B7280' }}>Group not found.</p>
    </div>
  );

  return (
    <div style={{ ...s, background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ height: 60, background: '#fff', borderBottom: '0.5px solid #E5E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/groups" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Groups</Link>
          <span style={{ fontSize: 13, color: '#E5E0D5' }}>/</span>
          <span style={{ fontSize: 13, color: '#111', fontWeight: 600 }}>{group.name}</span>
        </div>
        {isTeacher && (
          <Link href={`/assignments/create?groupId=${group._id}`} style={{ padding: '7px 14px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            + Add Assignment
          </Link>
        )}
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>
        {/* Header card */}
        <div style={{ background: '#0A4A3C', borderRadius: 16, padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(242,183,89,0.7)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{group.subject}</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{group.name}</h1>
            {group.description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px' }}>{group.description}</p>}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>by {group.teacherName} · {group.students.length} students</p>
          </div>
          {isTeacher && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: 10, color: 'rgba(242,183,89,0.7)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Join Code</p>
              <div style={{ background: 'rgba(242,183,89,0.15)', border: '1px solid rgba(242,183,89,0.3)', borderRadius: 10, padding: '8px 16px', marginBottom: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#F2B759', letterSpacing: '4px' }}>{group.joinCode}</span>
              </div>
              <button onClick={copyCode} style={{ fontSize: 11, color: copied ? '#F2B759' : 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {copied ? '✓ Copied!' : 'Copy code'}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 10, padding: 4, border: '0.5px solid #E5E0D5', width: 'fit-content' }}>
          {(['assignments', 'students'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', textTransform: 'capitalize' as const,
              background: tab === t ? '#0A4A3C' : 'transparent',
              color: tab === t ? '#F2B759' : '#6B7280',
            }}>
              {t} {t === 'assignments' ? `(${assignments.length})` : `(${group.students.length})`}
            </button>
          ))}
        </div>
<Link href={`/groups/${id}/forum`} style={{ padding: '7px 14px', background: '#F5F0E8', color: '#0A4A3C', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
  💬 Discussion
</Link>
        {/* Assignments tab */}
        {tab === 'assignments' && (
          assignments.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E5E0D5', padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 12px' }}>No assignments yet.</p>
              {isTeacher && (
                <Link href={`/assignments/create?groupId=${group._id}`} style={{ display: 'inline-block', padding: '8px 18px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>+ Add Assignment</Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {assignments.map((a) => {
                const isOverdue = new Date(a.dueDate) < new Date();
                const statusBg: Record<string, string> = { completed: 'rgba(10,74,60,0.08)', pending: 'rgba(242,183,89,0.15)', processing: '#EFF6FF', failed: '#FEF2F2' };
                const statusColor: Record<string, string> = { completed: '#0A4A3C', pending: '#92651a', processing: '#1D4ED8', failed: '#DC2626' };
                return (
                  <div key={a._id} style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #E5E0D5', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                      <p style={{ fontSize: 11, color: isOverdue ? '#DC2626' : '#9CA3AF', margin: 0 }}>Due {new Date(a.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: statusBg[a.status] || '#F3F4F6', color: statusColor[a.status] || '#6B7280', textTransform: 'capitalize' as const, flexShrink: 0 }}>
                      {a.status}
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <Link href={`/assignments/${a._id}`} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: '#F5F0E8', color: '#0A4A3C', textDecoration: 'none' }}>View</Link>
                      {isTeacher ? (
                        <Link href={`/assignments/review/${a._id}`} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: '#0A4A3C', color: '#F2B759', textDecoration: 'none' }}>Submissions</Link>
                      ) : (
                        <Link href={`/assignments/submit/${a._id}`} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: '#0A4A3C', color: '#F2B759', textDecoration: 'none' }}>Submit</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Students tab */}
        {tab === 'students' && (
          group.students.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #E5E0D5', padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No students yet. Share the join code!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.students.map((st) => (
                <div key={st.userId} style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #E5E0D5', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F2B759' }}>{st.name[0].toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{st.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{st.email}</p>
                  </div>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, flexShrink: 0 }}>Joined {new Date(st.joinedAt).toLocaleDateString()}</p>
                  {isTeacher && (
                    <button onClick={() => handleRemoveStudent(st.userId)} style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Bottom actions */}
        <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
          {!isTeacher && (
            <button onClick={handleLeave} style={{ padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Leave Class
            </button>
          )}
          {isTeacher && (
            <button onClick={handleDelete} style={{ padding: '8px 16px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Delete Class
            </button>
          )}
        </div>
      </div>
    </div>
  );
}