'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/hooks/useAuth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function getToken() {
  try { return JSON.parse(localStorage.getItem('edupilot-auth') || '{}')?.state?.token; } catch { return null; }
}

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !subject) { setError('Name and subject are required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, subject, description, teacherName: user?.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');
      router.push(`/groups/${data.group._id}`);
    } catch (err: any) {
      setError(err.message); setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #E2E5EC', fontSize: 14, outline: 'none',
    background: '#FAFAF8', boxSizing: 'border-box' as const,
  };

  return <div className="workspace-page"><Topbar title="Create a classroom"/>
   <div className="workspace-content"><Link className="teacher-back" href="/groups">← Back to your classes</Link><div className="class-builder">
    <section className="class-builder-story"><span className="workspace-eyebrow">GREAT THINGS START HERE</span><h1>A space for<br/><em>bright minds.</em></h1><p>Give your students a place to ask, discover, and grow together.</p><div className="builder-book" aria-hidden="true"><span>◫</span><i>✳</i></div><ol><li><span>01</span><div><strong>Make it yours</strong><p>A name, a subject, a little personality.</p></div></li><li><span>02</span><div><strong>Bring everyone together</strong><p>Share your unique class code with students.</p></div></li><li><span>03</span><div><strong>Let the learning begin</strong><p>Post assignments and start a conversation.</p></div></li></ol></section>
    <section className="class-builder-form"><span className="workspace-eyebrow">YOUR NEW CLASSROOM</span><h2>Set the scene.</h2><p>The best learning starts with a sense of belonging.</p><form onSubmit={handleSubmit}>
     {error&&<div className="dashboard-error" role="alert">{error}</div>}
     <label htmlFor="class-name">Class name <span>Required</span></label><input id="class-name" value={name} onChange={e=>setName(e.target.value)} required placeholder="e.g. Grade 10 — Physics"/>
     <label htmlFor="class-subject">Subject <span>Required</span></label><input id="class-subject" value={subject} onChange={e=>setSubject(e.target.value)} required placeholder="e.g. Physics"/>
     <label htmlFor="class-description">A little about this class <span>Optional</span></label><textarea id="class-description" value={description} onChange={e=>setDescription(e.target.value)} rows={4} placeholder="What will your students discover here?"/>
     <div className="builder-code-note"><span aria-hidden="true">↗</span><p>A unique join code will be created automatically. Share it when you’re ready.</p></div>
     <button className="button button-primary" type="submit" disabled={loading}>{loading?'Creating your classroom…':'Create classroom'} <span aria-hidden="true">↗</span></button>
    </form></section>
   </div></div></div>;
}
