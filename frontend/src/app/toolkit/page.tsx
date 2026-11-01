'use client';

import { useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { InteriorHero } from '@/components/InteriorHero';

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
    mcq: { bg: 'rgba(49,94,216,0.08)', color: '#315ED8' },
    true_false: { bg: 'rgba(49,94,216,0.15)', color: '#92651a' },
    fill_blank: { bg: 'rgba(49,94,216,0.05)', color: '#315ED8' },
  };
  const tc = typeColors[question.type];

  return (
    <div className="quiz-result-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#315ED8' }}>Q{index + 1}</span>
        <span style={{ fontSize: 13, padding: '2px 8px', borderRadius: 20, background: tc.bg, color: tc.color, fontWeight: 600 }}>
          {TYPE_LABELS[question.type]}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9CA3AF' }}>{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
      </div>
      <p style={{ fontSize: 14, color: '#111', margin: '0 0 12px', lineHeight: 1.5 }}>{question.text}</p>
      {question.type === 'mcq' && question.options && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          {question.options.map((opt) => (
            <div key={opt.label} style={{ fontSize: 14, padding: '7px 10px', borderRadius: 8, border: '0.5px solid #E2E5EC', color: '#374151', background: '#FAFAF8' }}>
              <strong style={{ color: '#315ED8' }}>{opt.label}.</strong> {opt.text}
            </div>
          ))}
        </div>
      )}
      {question.type === 'true_false' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {['True', 'False'].map((opt) => (
            <div key={opt} style={{ fontSize: 14, padding: '6px 18px', borderRadius: 8, border: '0.5px solid #E2E5EC', color: '#374151', background: '#FAFAF8' }}>{opt}</div>
          ))}
        </div>
      )}
      <button aria-expanded={revealed} onClick={() => setRevealed(!revealed)} style={{ fontSize: 14, color: '#315ED8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
        {revealed ? '▲ Hide answer' : '▼ Show answer'}
      </button>
      {revealed && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(49,94,216,0.06)', borderRadius: 8, border: '1px solid rgba(49,94,216,0.15)' }}>
          <p style={{ fontSize: 14, color: '#315ED8', margin: 0 }}><strong>Answer:</strong> {question.answer}</p>
          {question.explanation && <p style={{ fontSize: 14, color: '#2d7a5f', margin: '4px 0 0' }}>{question.explanation}</p>}
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
        if (pollData.quiz.status === 'failed') throw new Error('Quiz generation failed. Please try again.');
        attempts++;
      }
      throw new Error('This is taking longer than expected. Please try again in a moment.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  }

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E5EC', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' };

  return (
    <div style={{ background: '#F7F5EF', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Topbar title="AI Teacher's Toolkit" />

      <div className="interior-content toolkit-content">
        <InteriorHero eyebrow="THE AI TEACHING STUDIO" title="Bring the spark." accent="We’ll bring the questions." description="A topic, a few thoughtful choices, and a fresh way to help your students discover what they know." kind="ideas"/>
        <div className="toolkit-layout"><aside className="studio-guide"><span className="interior-eyebrow">FROM IDEA TO DISCOVERY</span><h2>A little inspiration.<br/>A lot of possibility.</h2>{[{n:'01',title:'Set the scene',text:'Choose a topic and the class you’re creating for.'},{n:'02',title:'Find the right balance',text:'Mix question styles and choose the length that feels right.'},{n:'03',title:'Make it your own',text:'Review the questions and answers before sharing with your class.'}].map(step=><div className="studio-step" key={step.n}><span>{step.n}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></div>)}<div className="studio-note"><span>✦</span><p>Your expertise is the finishing touch. Always review generated questions before use.</p></div></aside>
        <div className="studio-form"><div className="studio-form-heading"><span className="interior-eyebrow">CREATE SOMETHING GOOD</span><h2>Your next quiz</h2><p>The details make the difference.</p></div>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 16 }}>{error}</div>
          )}

          <div className="studio-fields">
            {[
              { label: 'Quiz Title', value: title, set: setTitle, placeholder: 'e.g. Chapter 3 Quiz' },
              { label: 'Subject', value: subject, set: setSubject, placeholder: 'e.g. Physics' },
              { label: 'Grade / Class', value: grade, set: setGrade, placeholder: 'e.g. Grade 9' },
              { label: 'Topic', value: topic, set: setTopic, placeholder: 'e.g. Laws of Motion' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label htmlFor={label} style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                <input id={label} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Number of Questions: <strong style={{ color: '#315ED8' }}>{totalQuestions}</strong>
            </label>
            <input type="range" min={5} max={30} value={totalQuestions} onChange={(e) => setTotalQuestions(Number(e.target.value))} style={{ width: '100%', accentColor: '#315ED8' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Question Types</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['mcq', 'true_false', 'fill_blank'] as QuizQuestionType[]).map((type) => (
                <button key={type} aria-pressed={questionTypes.includes(type)} onClick={() => toggleType(type)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  background: questionTypes.includes(type) ? '#315ED8' : '#fff',
                  color: questionTypes.includes(type) ? '#FFFFFF' : '#6B7280',
                  borderColor: questionTypes.includes(type) ? '#315ED8' : '#E2E5EC',
                }}>
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Upload Notes / PDF <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
            </label>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ fontSize: 14, color: '#374151' }} />
          </div>

          <button onClick={handleGenerate} disabled={status === 'generating'} style={{
            width: '100%', padding: '11px 0', borderRadius: 10,
            background: status === 'generating' ? '#9CA3AF' : '#315ED8',
            color: status === 'generating' ? '#fff' : '#FFFFFF',
            fontSize: 14, fontWeight: 700, border: 'none',
            cursor: status === 'generating' ? 'not-allowed' : 'pointer',
          }}>
            {status === 'generating' ? '⏳ Generating Quiz…' : '✦ Generate Quiz'}
          </button>
        </div>

        </div>
        {status === 'done' && quiz && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#315ED8', margin: 0 }}>
                {quiz.title} <span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280' }}>({quiz.questions.length} questions)</span>
              </h2>
              <button onClick={() => { setStatus('idle'); setQuiz(null); }} style={{
                fontSize: 14, color: '#315ED8', background: '#fff', border: '0.5px solid #E2E5EC', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600,
              }}>New Quiz</button>
            </div>
            {quiz.questions.map((q, i) => <QuizCard key={q.id} question={q} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}