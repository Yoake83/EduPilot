'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { WorkspaceBanner } from '@/components/WorkspaceBanner';
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

  return <div className="workspace-page"><Topbar title={isTeacher ? 'My classes' : 'Enrolled classes'} action={{label:isTeacher?'+ Create class':'+ Join class',href:isTeacher?'/groups/create':'/groups/join'}}/>
   <div className="workspace-content">
    <WorkspaceBanner eyebrow="A PLACE TO BELONG" title={isTeacher?'Small classrooms. Big possibilities.':'Good things happen together.'} description={isTeacher?'Make space for questions, connections, and the next great idea.':'Your classes, your people, your next big discovery. Pick up where you left off.'} count={groups.length} noun={groups.length===1?'class in your world':'classes in your world'} action={{href:isTeacher?'/groups/create':'/groups/join',label:isTeacher?'Build a new classroom':'Have a class code? Join a class'}}/>
    <div className="workspace-list-heading"><h2>{isTeacher?'Your classrooms':'Your learning spaces'} <span>{groups.length}</span></h2><p>Make yourself at home.</p></div>
    {loading?<div className="class-collection" aria-label="Loading classes">{[0,1,2].map(i=><div className="class-placeholder" key={i}/>)}</div>:groups.length===0?<div className="workspace-empty"><span className="empty-drawing" aria-hidden="true">◫</span><h2>A fresh start, together.</h2><p>{isTeacher?'Your first classroom is the beginning of something great.':'Ask your teacher for a class code. Your next chapter is waiting.'}</p><Link className="button button-primary" href={isTeacher?'/groups/create':'/groups/join'}>{isTeacher?'Create your first class':'Join your first class'} <span aria-hidden="true">↗</span></Link></div>:<div className="class-collection">{groups.map((g,i)=><Link key={g._id} href={`/groups/${g._id}`} className={`learning-space space-${i%4}`} style={{animationDelay:`${Math.min(i,5)*60}ms`}}><div className="space-cover"><span className="space-subject">{g.subject}</span><div className="space-art" aria-hidden="true"><i/><i/><i/><b>✳</b></div><span className="space-index">CLASS / {String(i+1).padStart(2,'0')}</span></div><div className="space-body"><h3>{g.name}</h3>{g.description&&<p className="space-description">{g.description}</p>}<div className="space-person"><span>{(g.teacherName||'T').slice(0,1)}</span><p>{isTeacher?`${g.students.length} students learning`:`With ${g.teacherName}`}</p></div><div className="space-bottom"><span>{isTeacher?`Code · ${g.joinCode}`:'Your next discovery is inside'}</span><span className="space-open" aria-label="Open class">↗</span></div></div></Link>)}</div>}
    <div className="workspace-tip"><span aria-hidden="true">✦</span><p><strong>A little connection goes a long way.</strong> Share ideas, ask questions, and learn something new together.</p></div>
   </div></div>;
}
