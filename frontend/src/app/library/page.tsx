'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';
import { format } from 'date-fns';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Assignment {
  _id: string; title: string; subject: string; grade: string;
  status: string; createdAt: string;
  result?: { totalMarks: number; sections: any[] };
  groupId?: { name: string };
}

interface Quiz {
  _id: string; title: string; subject: string; grade: string;
  topic: string; status: string; totalQuestions: number;
  questionTypes: string[]; createdAt: string;
}

type Tab = 'all' | 'papers' | 'quizzes';

export default function LibraryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const headers = authHeaders();
    Promise.all([
      fetch(`${API}/api/assignments`, { headers }).then(r => r.json()),
      fetch(`${API}/api/quiz`, { headers }).then(r => r.json()),
    ]).then(([aData, qData]) => {
      // Library only shows completed items
      setAssignments((aData.assignments || []).filter((a: Assignment) => a.status === 'completed'));
      setQuizzes((qData.quizzes || []).filter((q: Quiz) => q.status === 'completed'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [mounted]);

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.toLowerCase().includes(search.toLowerCase()) ||
    q.topic?.toLowerCase().includes(search.toLowerCase())
  );

  const showPapers = tab === 'all' || tab === 'papers';
  const showQuizzes = tab === 'all' || tab === 'quizzes';
  const totalItems = filteredAssignments.length + filteredQuizzes.length;

  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  return (
    <div style={{ ...s, background: '#F5F0E8', minHeight: '100vh' }}>
      <Topbar title="My Library" />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>My Library</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>All your generated question papers and quizzes</p>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search library…"
              style={{ padding: '9px 12px 9px 32px', border: '0.5px solid #E5E0D5', borderRadius: 10, fontSize: 13, outline: 'none', width: 220, background: '#fff' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 10, padding: 4, border: '0.5px solid #E5E0D5', width: 'fit-content' }}>
          {([
            { key: 'all', label: `All (${assignments.length + quizzes.length})` },
            { key: 'papers', label: `Question Papers (${assignments.length})` },
            { key: 'quizzes', label: `Quizzes (${quizzes.length})` },
          ] as { key: Tab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: tab === t.key ? '#0A4A3C' : 'transparent',
              color: tab === t.key ? '#F2B759' : '#6B7280',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #F2B759', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : totalItems === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>
              {search ? 'No results found' : 'Your library is empty'}
            </p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px' }}>
              {search ? 'Try a different search term' : 'Generated question papers and quizzes will appear here'}
            </p>
            {!search && isTeacher && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link href="/assignments/create" style={{ padding: '9px 20px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  Create Assignment
                </Link>
                <Link href="/toolkit" style={{ padding: '9px 20px', background: '#fff', color: '#0A4A3C', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '0.5px solid #E5E0D5' }}>
                  Generate Quiz
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Question Papers section */}
            {showPapers && filteredAssignments.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {tab === 'all' && (
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>
                    📄 Question Papers
                  </h2>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {filteredAssignments.map(a => (
                    <Link key={a._id} href={`/assignments/${a._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '18px 20px', cursor: 'pointer', height: '100%', boxSizing: 'border-box' as const }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,74,60,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        {/* Icon */}
                        <div style={{ width: 42, height: 42, background: 'rgba(10,74,60,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>
                          📄
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.title}
                        </p>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px' }}>
                          {a.subject} · {a.grade}
                        </p>
                        {a.groupId && (
                          <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 10px' }}>📚 {a.groupId.name}</p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '0.5px solid #F5F0E8' }}>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{format(new Date(a.createdAt), 'dd MMM yyyy')}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {a.result?.totalMarks && (
                              <span style={{ fontSize: 11, color: '#6B7280' }}>{a.result.totalMarks} marks</span>
                            )}
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(10,74,60,0.08)', color: '#0A4A3C' }}>
                              Paper
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quizzes section */}
            {showQuizzes && filteredQuizzes.length > 0 && (
              <div>
                {tab === 'all' && (
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>
                    📝 Quizzes
                  </h2>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {filteredQuizzes.map(q => (
                    <Link key={q._id} href={`/toolkit?quizId=${q._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '18px 20px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,74,60,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <div style={{ width: 42, height: 42, background: 'rgba(242,183,89,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>
                          📝
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.title}
                        </p>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 4px' }}>
                          {q.subject} · {q.topic}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                          {q.questionTypes.map(t => (
                            <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(10,74,60,0.06)', color: '#0A4A3C' }}>
                              {t === 'mcq' ? 'MCQ' : t === 'true_false' ? 'T/F' : 'Fill'}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '0.5px solid #F5F0E8' }}>
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{format(new Date(q.createdAt), 'dd MMM yyyy')}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, color: '#6B7280' }}>{q.totalQuestions} questions</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(242,183,89,0.15)', color: '#92651a' }}>
                              Quiz
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results for current tab */}
            {((showPapers && !showQuizzes && filteredAssignments.length === 0) ||
              (showQuizzes && !showPapers && filteredQuizzes.length === 0) ||
              (showPapers && showQuizzes && totalItems === 0)) && (
              <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No {tab === 'papers' ? 'question papers' : tab === 'quizzes' ? 'quizzes' : 'items'} match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}