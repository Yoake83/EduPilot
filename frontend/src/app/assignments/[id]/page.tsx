'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAssignmentWebSocket } from '@/hooks/useAssignmentWebSocket';
import type { GeneratedPaper, Section, Question } from '@/store/assignmentStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AssignmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { generationProgress } = useAssignmentStore();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useAssignmentWebSocket(id);

  useEffect(() => {
    let interval: any;

    async function fetchAssignment() {
      try {
        const res = await fetch(`${API}/api/assignments/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.assignment) {
          setAssignment(data.assignment);
          if (data.assignment.status === 'completed' || data.assignment.status === 'failed') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
    interval = setInterval(fetchAssignment, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F2F2F2' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #F5A623', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F2', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/assignments')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18, padding: 0 }}>←</button>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>Create New</span>
        </div>
        {assignment?.status === 'completed' && assignment?.result && (
          <button
            onClick={() => handlePrint(assignment.result)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
          >
            ⬇ Download as PDF
          </button>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

        {/* AI banner */}
        <div style={{ background: '#111', color: '#fff', borderRadius: 14, padding: '16px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, flex: 1 }}>
            {assignment?.status === 'completed'
              ? `Certainly! Here are customized Question Papers for your ${assignment?.grade} ${assignment?.subject} classes.`
              : assignment?.status === 'failed'
              ? 'Generation failed. Please try again.'
              : 'Generating your question paper... Please wait.'}
          </p>
          {assignment?.status === 'completed' && assignment?.result && (
            <button
              onClick={() => handlePrint(assignment.result)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              ⬇ Download as PDF
            </button>
          )}
        </div>

        {/* Processing */}
        {(assignment?.status === 'pending' || assignment?.status === 'processing') && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 56, height: 56, border: '4px solid #F5A623', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }}/>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 6px' }}>Generating Question Paper</h2>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>AI is crafting your personalized assessment...</p>
            </div>
            <div style={{ width: 260, background: '#F3F4F6', borderRadius: 999, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#F5A623', borderRadius: 999, width: `${generationProgress || 10}%`, transition: 'width 0.5s ease' }}/>
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{generationProgress || 0}%</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Completed paper */}
        {assignment?.status === 'completed' && assignment?.result && (
          <QuestionPaperOutput paper={assignment.result} />
        )}

        {/* Failed */}
        {assignment?.status === 'failed' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #FCA5A5', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ color: '#EF4444', fontWeight: 600, marginBottom: 8, fontSize: 15 }}>Generation failed</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Please go back and try creating the assignment again.</p>
            <button onClick={() => router.push('/assignments/create')} style={{ padding: '9px 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Paper Output ── */
function QuestionPaperOutput({ paper }: { paper: GeneratedPaper }) {
  return (
    <div id="question-paper" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

      {/* School header */}
      <div style={{ textAlign: 'center', padding: '32px 40px 24px', borderBottom: '1px solid #E5E7EB' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: '-0.3px' }}>{paper.schoolName}</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 2px' }}>Subject: {paper.subject}</p>
        <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0 }}>Class: {paper.grade}</p>
      </div>

      {/* Time + Marks row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 40px', background: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>Time Allowed: <b style={{ color: '#111', fontWeight: 500 }}>{paper.timeAllowed}</b></span>
        <span style={{ fontSize: 13, color: '#6B7280' }}>Maximum Marks: <b style={{ color: '#111', fontWeight: 500 }}>{paper.totalMarks}</b></span>
      </div>

      <div style={{ padding: '24px 40px' }}>

        {/* Instructions */}
        <p style={{ fontSize: 12.5, color: '#6B7280', fontStyle: 'italic', margin: '0 0 20px', borderBottom: '1px solid #F3F4F6', paddingBottom: 16 }}>
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #E5E7EB' }}>
          {['Name', 'Roll Number', 'Class/ Section'].map((label) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
              <span style={{ fontWeight: 500 }}>{label}:</span>
              <span style={{ borderBottom: '1.5px solid #374151', width: 120, display: 'inline-block', height: 18 }}/>
            </div>
          ))}
        </div>

        {/* Sections */}
        {paper.sections.map((section, si) => (
          <SectionBlock key={si} section={section} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: Section }) {
  return (
    <div style={{ marginBottom: 36 }}>
      {/* Section title */}
      <h2 style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', color: '#111', margin: '0 0 4px', letterSpacing: '-0.2px' }}>
        {section.title}
      </h2>
      <p style={{ fontSize: 12.5, color: '#6B7280', textAlign: 'center', fontStyle: 'italic', margin: '0 0 18px' }}>
        {section.instruction}
      </p>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {section.questions.map((q, qi) => (
          <QuestionItem key={q.id} question={q} index={qi + 1} />
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 20, fontWeight: 500, letterSpacing: '0.3px' }}>
        End of {section.title}
      </p>

      {/* Divider between sections */}
      <div style={{ borderBottom: '1px dashed #E5E7EB', marginTop: 8 }}/>
    </div>
  );
}

function QuestionItem({ question, index }: { question: Question; index: number }) {
  const diff: Record<string, { label: string; color: string; bg: string }> = {
    easy: { label: 'Easy', color: '#059669', bg: '#ECFDF5' },
    moderate: { label: 'Moderate', color: '#D97706', bg: '#FFFBEB' },
    hard: { label: 'Hard', color: '#DC2626', bg: '#FEF2F2' },
  };
  const dc = diff[question.difficulty] || diff.moderate;

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#374151', minWidth: 22, paddingTop: 1 }}>{index}.</span>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <p style={{ margin: 0, fontSize: 13.5, color: '#111', lineHeight: 1.65, flex: 1 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
            marginRight: 8, color: dc.color, background: dc.bg,
            display: 'inline-block', verticalAlign: 'middle',
          }}>
            [{dc.label}]
          </span>
          {question.text}
        </p>
        <span style={{ fontSize: 12.5, color: '#9CA3AF', whiteSpace: 'nowrap', paddingTop: 2, fontWeight: 500 }}>
          [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
        </span>
      </div>
    </div>
  );
}

/* ── PDF Print ── */
function handlePrint(paper: GeneratedPaper) {
  const win = window.open('', '_blank');
  if (!win) return;

  const sectionsHTML = paper.sections.map((sec) => `
    <div style="margin-bottom:32px">
      <h3 style="text-align:center;font-size:15px;font-weight:700;margin:0 0 4px">${sec.title}</h3>
      <p style="text-align:center;font-style:italic;color:#666;font-size:12px;margin:0 0 16px">${sec.instruction}</p>
      ${sec.questions.map((q, i) => `
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:flex-start">
          <span style="font-weight:600;min-width:20px;font-size:13px">${i + 1}.</span>
          <div style="flex:1;display:flex;justify-content:space-between;gap:16px">
            <p style="margin:0;font-size:13px;line-height:1.65;flex:1">${q.text}</p>
            <span style="color:#999;font-size:12px;white-space:nowrap">[${q.marks} Marks]</span>
          </div>
        </div>`).join('')}
      <p style="text-align:center;color:#999;font-size:11px;margin-top:16px">End of ${sec.title}</p>
      <hr style="border:none;border-top:1px dashed #ddd;margin-top:8px"/>
    </div>`).join('');

  win.document.write(`<!DOCTYPE html>
    <html><head><title>${paper.schoolName}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;font-size:13px;color:#111}
      h1{font-size:18px;text-align:center;margin:0 0 4px;font-weight:700}
      .sub{text-align:center;color:#555;font-size:13px;margin:0 0 2px}
      .meta{display:flex;justify-content:space-between;border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:10px 0;margin:16px 0;font-size:12.5px;color:#555}
      .student{display:flex;gap:28px;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid #eee;font-size:13px}
      @media print{body{margin:20px}}
    </style></head>
    <body>
      <h1>${paper.schoolName}</h1>
      <p class="sub">Subject: ${paper.subject}</p>
      <p class="sub">Class: ${paper.grade}</p>
      <div class="meta">
        <span>Time Allowed: ${paper.timeAllowed}</span>
        <span>Maximum Marks: ${paper.totalMarks}</span>
      </div>
      <p style="font-size:12px;font-style:italic;color:#555;margin-bottom:18px">All questions are compulsory unless stated otherwise.</p>
      <div class="student">
        <span>Name: _______________</span>
        <span>Roll Number: _______________</span>
        <span>Section: _______________</span>
      </div>
      ${sectionsHTML}
    </body></html>`);
  win.document.close();
  win.print();
}