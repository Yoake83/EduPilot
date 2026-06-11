'use client';

import { useState } from 'react';

type QuizQuestionType = 'mcq' | 'true_false' | 'fill_blank';
type QuizStatus = 'idle' | 'generating' | 'done' | 'error';

interface MCQOption { label: string; text: string; }
interface QuizQuestion {
  id: string; type: QuizQuestionType; text: string;
  options?: MCQOption[]; answer: string; explanation?: string; marks: number;
}
interface Quiz { _id: string; title: string; questions: QuizQuestion[]; }

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TYPE_LABELS: Record<QuizQuestionType, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
};

function getToken() {
  try { return JSON.parse(localStorage.getItem('edupilot-auth') || '{}')?.state?.token; }
  catch { return null; }
}

function QuizCard({ question, index }: { question: QuizQuestion; index: number }) {
  const [revealed, setRevealed] = useState(false);
  const typeColors: Record<QuizQuestionType, { bg: string; color: string }> = {
    mcq: { bg: 'rgba(10,74,60,0.08)', color: '#0A4A3C' },
    true_false: { bg: 'rgba(242,183,89,0.15)', color: '#92651a' },
    fill_blank: { bg: 'rgba(10,74,60,0.05)', color: '#0A4A3C' },
  };
  const tc = typeColors[question.type];

  return (
    <div style={{ background: '#fff', border: '0.5px solid #E5E0D5', borderRadius: 12, padding: '16px 20px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0A4A3C' }}>Q{index + 1}</span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: tc.bg, color: tc.color, fontWeight: 600 }}>
          {TYPE_LABELS[question.type]}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
      </div>
      <p style={{ fontSize: 14, color: '#111', margin: '0 0 12px', lineHeight: 1.5 }}>{question.text}</p>
      {question.type === 'mcq' && question.options && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          {question.options.map((opt) => (
            <div key={opt.label} style={{ fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '0.5px solid #E5E0D5', color: '#374151', background: '#FAFAF8' }}>
              <strong style={{ color: '#0A4A3C' }}>{opt.label}.</strong> {opt.text}
            </div>
          ))}
        </div>
      )}
      {question.type === 'true_false' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {['True', 'False'].map((opt) => (
            <div key={opt} style={{ fontSize: 13, padding: '6px 18px', borderRadius: 8, border: '0.5px solid #E5E0D5', color: '#374151', background: '#FAFAF8' }}>{opt}</div>
          ))}
        </div>
      )}
      <button onClick={() => setRevealed(!revealed)} style={{ fontSize: 12, color: '#0A4A3C', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
        {revealed ? '▲ Hide answer' : '▼ Show answer'}
      </button>
      {revealed && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(10,74,60,0.06)', borderRadius: 8, border: '1px solid rgba(10,74,60,0.15)' }}>
          <p style={{ fontSize: 13, color: '#0A4A3C', margin: 0 }}><strong>Answer:</strong> {question.answer}</p>
          {question.explanation && <p style={{ fontSize: 12, color: '#2d7a5f', margin: '4px 0 0' }}>{question.explanation}</p>}
        </div>
      )}
    </div>
  );
}

export default function ToolkitPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuizQuestionType[]>(['mcq']);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState('');

  function toggleType(type: QuizQuestionType) {
    setQuestionTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  }

  async function handleGenerate() {
    if (!title || !subject || !grade || !topic || questionTypes.length === 0) {
      setError('Please fill in all fields and select at least one question type.');
      return;
    }
    setError(''); setStatus('generating');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('grade', grade);
      formData.append('topic', topic);
      formData.append('totalQuestions', String(totalQuestions));
      formData.append('questionTypes', JSON.stringify(questionTypes));
      if (file) formData.append('file', file);

      const createRes = await fetch(`${API}/api/quiz`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create quiz');

      const quizId = createData.quiz._id;

      // Poll up to 90 seconds (45 attempts × 2s)
      let attempts = 0;
      while (attempts < 45) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(`${API}/api/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const pollData = await pollRes.json();
        if (pollData.quiz.status === 'completed') { setQuiz(pollData.quiz); setStatus('done'); return; }
        if (pollData.quiz.status === 'failed') throw new Error('Quiz generation failed — check worker terminal');
        attempts++;
      }
      throw new Error('Generation timed out — make sure the quiz worker is running (npm run worker:quiz)');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  }

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' };

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Topbar */}
      <div style={{ height: 60, background: '#fff', borderBottom: '0.5px solid #E5E0D5', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>AI Teacher&apos;s Toolkit</span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>AI Quiz Generator</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px' }}>Generate MCQs, True/False, and Fill-in-the-blank questions instantly</p>

        <div style={{ background: '#fff', border: '0.5px solid #E5E0D5', borderRadius: 14, padding: 24, marginBottom: 24 }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {[
              { label: 'Quiz Title', value: title, set: setTitle, placeholder: 'e.g. Chapter 3 Quiz' },
              { label: 'Subject', value: subject, set: setSubject, placeholder: 'e.g. Physics' },
              { label: 'Grade / Class', value: grade, set: setGrade, placeholder: 'e.g. Grade 9' },
              { label: 'Topic', value: topic, set: setTopic, placeholder: 'e.g. Laws of Motion' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Number of Questions: <strong style={{ color: '#0A4A3C' }}>{totalQuestions}</strong>
            </label>
            <input type="range" min={5} max={30} value={totalQuestions} onChange={(e) => setTotalQuestions(Number(e.target.value))} style={{ width: '100%', accentColor: '#0A4A3C' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Question Types</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['mcq', 'true_false', 'fill_blank'] as QuizQuestionType[]).map((type) => (
                <button key={type} onClick={() => toggleType(type)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  background: questionTypes.includes(type) ? '#0A4A3C' : '#fff',
                  color: questionTypes.includes(type) ? '#F2B759' : '#6B7280',
                  borderColor: questionTypes.includes(type) ? '#0A4A3C' : '#E5E0D5',
                }}>
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Upload Notes / PDF <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
            </label>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: '#374151' }} />
          </div>

          <button onClick={handleGenerate} disabled={status === 'generating'} style={{
            width: '100%', padding: '11px 0', borderRadius: 10,
            background: status === 'generating' ? '#9CA3AF' : '#0A4A3C',
            color: status === 'generating' ? '#fff' : '#F2B759',
            fontSize: 14, fontWeight: 700, border: 'none',
            cursor: status === 'generating' ? 'not-allowed' : 'pointer',
          }}>
            {status === 'generating' ? '⏳ Generating Quiz…' : '✦ Generate Quiz'}
          </button>
        </div>

        {status === 'done' && quiz && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0A4A3C', margin: 0 }}>
                {quiz.title} <span style={{ fontSize: 13, fontWeight: 400, color: '#6B7280' }}>({quiz.questions.length} questions)</span>
              </h2>
              <button onClick={() => { setStatus('idle'); setQuiz(null); }} style={{
                fontSize: 12, color: '#0A4A3C', background: '#fff', border: '0.5px solid #E5E0D5', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600,
              }}>New Quiz</button>
            </div>
            {quiz.questions.map((q, i) => <QuizCard key={q.id} question={q} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}