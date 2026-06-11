'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken() {
  try { return JSON.parse(localStorage.getItem('edupilot-auth') || '{}')?.state?.token; }
  catch { return null; }
}

interface Submission {
  _id: string; studentName: string; fileName: string; fileSize: number;
  status: 'submitted' | 'under_review' | 'graded';
  grade?: number; maxGrade?: number; feedback?: string; createdAt: string;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  submitted: { bg: '#EFF6FF', color: '#1D4ED8' },
  under_review: { bg: '#FFF7ED', color: '#C2410C' },
  graded: { bg: '#F0FDF4', color: '#15803D' },
};

export default function ReviewSubmissionsPage() {
  const { assignmentId } = useParams() as { assignmentId: string };
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', maxGrade: '100', feedback: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/submissions/${assignmentId}/all`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.json()).then(d => { setSubmissions(d.submissions || []); setLoading(false); });
  }, [assignmentId]);

  async function handleGrade(submissionId: string) {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/submissions/${submissionId}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ grade: Number(gradeForm.grade), maxGrade: Number(gradeForm.maxGrade), feedback: gradeForm.feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmissions(prev => prev.map(s => s._id === submissionId ? { ...s, ...data.submission } : s));
      setGrading(null);
      setGradeForm({ grade: '', maxGrade: '100', feedback: '' });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Link href="/assignments" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>← Back</Link>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>Submissions</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{submissions.length} student{submissions.length !== 1 ? 's' : ''} submitted</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <p style={{ fontSize: 14 }}>No submissions yet</p>
        </div>
      ) : (
        submissions.map((s) => (
          <div key={s._id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#374151' }}>
                  {s.studentName[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{s.studentName}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>📄 {s.fileName} · {(s.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {s.status === 'graded' && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>{s.grade}/{s.maxGrade}</span>
                )}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, ...statusColors[s.status] }}>
                  {s.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {s.feedback && <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 8px', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>{s.feedback}</p>}

            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 10px' }}>Submitted {new Date(s.createdAt).toLocaleDateString()}</p>

            {grading === s._id ? (
              <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 14, border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Grade</label>
                    <input type="number" value={gradeForm.grade} onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))}
                      placeholder="e.g. 85" style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' as const }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Max Grade</label>
                    <input type="number" value={gradeForm.maxGrade} onChange={e => setGradeForm(f => ({ ...f, maxGrade: e.target.value }))}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' as const }} />
                  </div>
                </div>
                <textarea value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                  placeholder="Write feedback for the student…" rows={2}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #E5E7EB', fontSize: 13, resize: 'none', marginBottom: 10, boxSizing: 'border-box' as const }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleGrade(s._id)} disabled={saving || !gradeForm.grade}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#1a1a1a', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    {saving ? 'Saving…' : 'Save Grade'}
                  </button>
                  <button onClick={() => setGrading(null)}
                    style={{ padding: '8px 16px', borderRadius: 8, background: '#fff', color: '#6B7280', fontSize: 13, border: '1px solid #E5E7EB', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setGrading(s._id); setGradeForm({ grade: String(s.grade || ''), maxGrade: String(s.maxGrade || 100), feedback: s.feedback || '' }); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', background: '#F3F4F6', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}>
                {s.status === 'graded' ? '✏️ Edit Grade' : '📝 Grade'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}