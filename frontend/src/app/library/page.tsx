'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';
import { format } from 'date-fns';
import { InteriorHero, IllustratedEmpty } from '@/components/InteriorHero';

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

  const visibleCount=(showPapers?filteredAssignments.length:0)+(showQuizzes?filteredQuizzes.length:0);
  return <div className="interior-page"><Topbar title="My library"/><div className="interior-content">
   <InteriorHero eyebrow="YOUR PERSONAL COLLECTION" title="Good ideas deserve" accent="a place to stay." description="Question papers, little challenges, and everything you’ve created. Thoughtfully gathered, ready when you are."/>
   <div className="collection-toolbar"><div className="collection-tabs" aria-label="Filter library">{([{key:'all',label:'Everything',count:assignments.length+quizzes.length},{key:'papers',label:'Question papers',count:assignments.length},{key:'quizzes',label:'Quizzes',count:quizzes.length}] as {key:Tab;label:string;count:number}[]).map(t=><button key={t.key} className={tab===t.key?'selected':''} aria-pressed={tab===t.key} onClick={()=>setTab(t.key)}>{t.label}<span>{t.count}</span></button>)}</div><label className="collection-search"><span aria-hidden="true">⌕</span><input aria-label="Search library" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find something inspiring…"/></label></div>
   {loading?<div className="interior-skeleton" aria-label="Loading library"/>:visibleCount===0?<IllustratedEmpty title={search?'A little change of words?':'Your collection starts here.'} description={search?'Try another title, subject, or topic to find what you’re looking for.':'Every paper you generate and every quiz you create will find a home on these shelves.'}>{!search&&isTeacher&&<><Link className="button button-primary" href="/assignments/create">Create a question paper ↗</Link><Link className="interior-secondary" href="/toolkit">Make a quiz</Link></>}</IllustratedEmpty>:<div className="collection-grid">
   {showPapers&&filteredAssignments.map((a,i)=><Link key={a._id} href={`/assignments/${a._id}`} className={`collection-card cover-${i%4}`}><div className="collection-cover"><span className="collection-category">QUESTION PAPER</span><div className="paper-art" aria-hidden="true"><i/><i/><i/><i/></div><span className="collection-open">↗</span></div><div className="collection-card-content"><span className="collection-subject">{a.subject} · {a.grade}</span><h2>{a.title}</h2><p>{a.groupId?.name || 'Your personal collection'}</p><footer><span>{format(new Date(a.createdAt),'dd MMM yyyy')}</span><strong>{a.result?.totalMarks ? `${a.result.totalMarks} marks`:'Paper'}</strong></footer></div></Link>)}
   {showQuizzes&&filteredQuizzes.map((q,i)=><Link key={q._id} href={`/toolkit?quizId=${q._id}`} className={`collection-card cover-${(i+1)%4}`}><div className="collection-cover"><span className="collection-category">QUIZ COLLECTION</span><div className="quiz-art" aria-hidden="true"><span>?</span><i>✓</i></div><span className="collection-open">↗</span></div><div className="collection-card-content"><span className="collection-subject">{q.subject} · {q.grade}</span><h2>{q.title}</h2><p>{q.topic}</p><footer><span>{format(new Date(q.createdAt),'dd MMM yyyy')}</span><strong>{q.totalQuestions} questions</strong></footer></div></Link>)}
   </div>}
   <div className="interior-footnote">A growing collection. A world of possibility. <span>✦</span></div>
  </div></div>;
}
