'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Group {
  _id: string; name: string; subject: string; description?: string;
  teacherName: string; joinCode: string; students: any[];
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/api/groups`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setGroups(d.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mounted]);

  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  return (
    <div style={{ ...s, background: '#F5F0E8', minHeight: '100vh' }}>
      <Topbar
        title={isTeacher ? 'My Classes' : 'Enrolled Classes'}
        action={{
          label: isTeacher ? '+ Create Group' : '+ Join Class',
          href: isTeacher ? '/groups/create' : '/groups/join',
        }}
      />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>
          {isTeacher ? 'My Classes' : 'Enrolled Classes'}
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px' }}>
          {isTeacher ? 'Manage your classes and students.' : 'All classes you have joined.'}
        </p>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #F2B759', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : groups.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>
              {isTeacher ? 'No classes yet' : 'No classes joined yet'}
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>
              {isTeacher ? 'Create your first class to get started.' : 'Enter a join code to enroll in a class.'}
            </p>
            <Link href={isTeacher ? '/groups/create' : '/groups/join'} style={{
              display: 'inline-block', padding: '9px 20px', background: '#0A4A3C',
              color: '#F2B759', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>
              {isTeacher ? '+ Create Class' : '+ Join Class'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {groups.map((g) => (
              <Link key={g._id} href={`/groups/${g._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '18px 20px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 18 }}>📚</span>
                    </div>
                    {isTeacher && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: 'rgba(242,183,89,0.15)', color: '#92651a', letterSpacing: '0.5px' }}>
                        {g.joinCode}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px' }}>{g.subject}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '0.5px solid #F0EDE8' }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                      {isTeacher ? `${g.students.length} students` : `by ${g.teacherName}`}
                    </span>
                    <span style={{ fontSize: 12, color: '#0A4A3C', fontWeight: 600 }}>View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}