'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken() {
  try { return JSON.parse(localStorage.getItem('edupilot-auth') || '{}')?.state?.token; }
  catch { return null; }
}

export default function SubmitAssignmentPage() {
  const { assignmentId } = useParams() as { assignmentId: string };
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [existing, setExisting] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/submissions/${assignmentId}/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.json()).then(d => { if (d.submission) setExisting(d.submission); });
  }, [assignmentId]);

  async function handleSubmit() {
    if (!file) { setError('Please select a file.'); return; }
    setError(''); setStatus('submitting');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/api/submissions/${assignmentId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setExisting(data.submission);
      setStatus('done');
    } catch (err: any) {
      setError(err.message); setStatus('error');
    }
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    submitted: { bg: '#EFF6FF', color: '#1D4ED8' },
    under_review: { bg: '#FFF7ED', color: '#C2410C' },
    graded: { bg: '#F0FDF4', color: '#15803D' },
  };

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Link href="/assignments" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        ← Back to Assignments
      </Link>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>Submit Assignment</h1>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 28px' }}>Upload your completed work as a PDF or document.</p>

      {existing && (
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Previous Submission</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, ...statusColors[existing.status] }}>
              {existing.status.replace('_', ' ')}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>📄 {existing.fileName}</p>
          {existing.status === 'graded' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#15803D', margin: '0 0 4px' }}>Grade: {existing.grade} / {existing.maxGrade}</p>
              {existing.feedback && <p style={{ fontSize: 12, color: '#166534', margin: 0 }}>{existing.feedback}</p>}
            </div>
          )}
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: '8px 0 0' }}>Submitted {new Date(existing.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 24 }}>
        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        {status === 'done' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#15803D', margin: '0 0 4px' }}>Submitted successfully!</p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Your teacher will review and grade your work.</p>
          </div>
        ) : (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              {existing ? 'Resubmit (replaces previous)' : 'Upload your work'}
            </label>
            <div style={{ border: '2px dashed #E5E7EB', borderRadius: 10, padding: '28px 20px', textAlign: 'center', marginBottom: 16, background: file ? '#F0FDF4' : '#FAFAFA' }}>
              <input type="file" accept=".pdf,.doc,.docx,.png,.jpg" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} id="file-input" />
              <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                <p style={{ fontSize: 14, color: file ? '#15803D' : '#6B7280', margin: '0 0 4px', fontWeight: file ? 600 : 400 }}>
                  {file ? `📄 ${file.name}` : '📎 Click to choose file'}
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>PDF, DOC, DOCX, PNG, JPG up to 20MB</p>
              </label>
            </div>
            <button onClick={handleSubmit} disabled={status === 'submitting' || !file}
              style={{ width: '100%', padding: '11px 0', borderRadius: 10, background: !file || status === 'submitting' ? '#9CA3AF' : '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: !file || status === 'submitting' ? 'not-allowed' : 'pointer' }}>
              {status === 'submitting' ? 'Submitting…' : existing ? 'Resubmit' : 'Submit Assignment'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}