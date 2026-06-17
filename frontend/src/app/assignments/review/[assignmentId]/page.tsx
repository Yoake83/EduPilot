'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface QuestionResult {
  questionId: string;
  questionText: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

interface Evaluation {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  feedback: string;
  suggestions: string;
  questionResults: QuestionResult[];
}

interface Submission {
  _id: string;
  studentName: string;
  fileName: string;
  fileSize: number;
  status: 'submitted' | 'under_review' | 'graded';
  grade?: number;
  maxGrade?: number;
  feedback?: string;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  submitted:    { bg: '#EFF6FF', color: '#1D4ED8' },
  under_review: { bg: 'rgba(242,183,89,0.15)', color: '#92651a' },
  graded:       { bg: 'rgba(10,74,60,0.08)', color: '#0A4A3C' },
};

export default function ReviewSubmissionsPage() {
  const { assignmentId } = useParams() as { assignmentId: string };
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Grading state
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', maxGrade: '100', feedback: '' });
  const [saving, setSaving] = useState(false);

  // AI evaluation state
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evalError, setEvalError] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/api/submissions/${assignmentId}/all`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setSubmissions(d.submissions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mounted, assignmentId]);

  async function handleAutoGrade(submissionId: string) {
    setEvaluatingId(submissionId);
    setEvaluation(null);
    setEvalError('');

    try {
      const res = await fetch(`${API}/api/evaluate/${submissionId}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Auto-grade failed');

      const ev: Evaluation = data.evaluation;
      setEvaluation(ev);

      // Pre-fill the grading form with AI results
      setGradeForm({
        grade: String(ev.totalMarks),
        maxGrade: String(ev.maxMarks),
        feedback: `${ev.feedback}\n\nSuggestions: ${ev.suggestions}`,
      });
      setGradingId(submissionId);
    } catch (err: any) {
      setEvalError(err.message);
    } finally {
      setEvaluatingId(null);
    }
  }

  async function handleGrade(submissionId: string) {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/submissions/${submissionId}/grade`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: Number(gradeForm.grade),
          maxGrade: Number(gradeForm.maxGrade),
          feedback: gradeForm.feedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmissions(prev => prev.map(s => s._id === submissionId ? { ...s, ...data.submission } : s));
      setGradingId(null);
      setEvaluation(null);
      setGradeForm({ grade: '', maxGrade: '100', feedback: '' });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  return (
    <div style={{ ...s, background: '#F5F0E8', minHeight: '100vh' }}>
      <Topbar title="Submissions" />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/assignments" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Assignments</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 2px' }}>Student Submissions</h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{submissions.length} student{submissions.length !== 1 ? 's' : ''} submitted</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              {submissions.filter(s => s.status === 'graded').length}/{submissions.length} graded
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, border: '3px solid #F2B759', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No submissions yet</p>
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub._id} style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '18px 20px', marginBottom: 12 }}>
              {/* Submission header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#F2B759', flexShrink: 0 }}>
                    {sub.studentName[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{sub.studentName}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>
                      📄 {sub.fileName} · {(sub.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sub.status === 'graded' && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0A4A3C' }}>{sub.grade}/{sub.maxGrade}</span>
                  )}
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, ...statusColors[sub.status] }}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {sub.feedback && (
                <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px', padding: '8px 12px', background: '#F9F7F5', borderRadius: 8 }}>
                  {sub.feedback}
                </p>
              )}

              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 12px' }}>
                Submitted {new Date(sub.createdAt).toLocaleDateString()}
              </p>

              {/* Error */}
              {evalError && evaluatingId === null && gradingId === sub._id && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 10 }}>
                  {evalError}
                </div>
              )}

              {/* AI Evaluation results */}
              {evaluation && gradingId === sub._id && (
                <div style={{ background: 'rgba(10,74,60,0.04)', border: '0.5px solid rgba(10,74,60,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 13 }}>🤖</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0A4A3C' }}>AI Evaluation Result</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: evaluation.percentage >= 75 ? '#059669' : evaluation.percentage >= 50 ? '#92651a' : '#DC2626', marginLeft: 'auto' }}>
                      {evaluation.totalMarks}/{evaluation.maxMarks} ({evaluation.percentage}%)
                    </span>
                  </div>

                  {/* Per-question breakdown */}
                  {evaluation.questionResults.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      {evaluation.questionResults.slice(0, 5).map((qr, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11 }}>
                          <span style={{ color: '#6B7280', flexShrink: 0, width: 16 }}>Q{i + 1}</span>
                          <span style={{ flex: 1, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qr.questionText}</span>
                          <span style={{ fontWeight: 700, color: qr.marksAwarded === qr.maxMarks ? '#059669' : '#92651a', flexShrink: 0 }}>
                            {qr.marksAwarded}/{qr.maxMarks}
                          </span>
                        </div>
                      ))}
                      {evaluation.questionResults.length > 5 && (
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0' }}>+{evaluation.questionResults.length - 5} more questions</p>
                      )}
                    </div>
                  )}

                  <p style={{ fontSize: 11, color: '#374151', margin: '0 0 4px' }}><strong>Feedback:</strong> {evaluation.feedback}</p>
                  {evaluation.suggestions && (
                    <p style={{ fontSize: 11, color: '#374151', margin: 0 }}><strong>Suggestions:</strong> {evaluation.suggestions}</p>
                  )}
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: '8px 0 0', fontStyle: 'italic' }}>
                    Review and adjust below before saving
                  </p>
                </div>
              )}

              {/* Grading form */}
              {gradingId === sub._id ? (
                <div style={{ background: '#F9F7F5', borderRadius: 10, padding: 14, border: '0.5px solid #E5E0D5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Grade</label>
                      <input type="number" value={gradeForm.grade}
                        onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))}
                        placeholder="e.g. 85"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E0D5', fontSize: 13, boxSizing: 'border-box' as const, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Max Grade</label>
                      <input type="number" value={gradeForm.maxGrade}
                        onChange={e => setGradeForm(f => ({ ...f, maxGrade: e.target.value }))}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #E5E0D5', fontSize: 13, boxSizing: 'border-box' as const, outline: 'none' }} />
                    </div>
                  </div>
                  <textarea value={gradeForm.feedback}
                    onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                    placeholder="Write feedback for the student…" rows={3}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #E5E0D5', fontSize: 12, resize: 'none', marginBottom: 10, boxSizing: 'border-box' as const, outline: 'none' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleGrade(sub._id)} disabled={saving || !gradeForm.grade}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: '#0A4A3C', color: '#F2B759', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      {saving ? 'Saving…' : '✓ Save Grade'}
                    </button>
                    <button onClick={() => { setGradingId(null); setEvaluation(null); setGradeForm({ grade: '', maxGrade: '100', feedback: '' }); }}
                      style={{ padding: '8px 16px', borderRadius: 8, background: '#fff', color: '#6B7280', fontSize: 13, border: '0.5px solid #E5E0D5', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Auto Grade button */}
                  <button
                    onClick={() => handleAutoGrade(sub._id)}
                    disabled={evaluatingId === sub._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 700,
                      padding: '7px 14px', borderRadius: 8,
                      background: evaluatingId === sub._id ? '#F5F0E8' : 'rgba(242,183,89,0.15)',
                      color: evaluatingId === sub._id ? '#9CA3AF' : '#92651a',
                      border: '0.5px solid rgba(242,183,89,0.4)',
                      cursor: evaluatingId === sub._id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {evaluatingId === sub._id ? (
                      <>
                        <div style={{ width: 12, height: 12, border: '2px solid #9CA3AF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Evaluating…
                      </>
                    ) : '🤖 Auto Grade'}
                  </button>

                  {/* Manual grade button */}
                  <button
                    onClick={() => {
                      setGradingId(sub._id);
                      setEvaluation(null);
                      setGradeForm({ grade: String(sub.grade || ''), maxGrade: String(sub.maxGrade || 100), feedback: sub.feedback || '' });
                    }}
                    style={{ fontSize: 12, fontWeight: 600, color: '#0A4A3C', background: '#F5F0E8', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}
                  >
                    {sub.status === 'graded' ? '✏️ Edit Grade' : '📝 Manual Grade'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}