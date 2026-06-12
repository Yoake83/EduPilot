'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Reply { _id: string; userId: string; userName: string; content: string; createdAt: string; }
interface Post { _id: string; userId: string; userName: string; userRole: string; title: string; content: string; tags: string[]; upvotes: string[]; replies: Reply[]; isPinned: boolean; createdAt: string; }

export default function ForumPage() {
  const { id: groupId } = useParams() as { id: string };
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/api/groups/${groupId}/posts`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mounted, groupId]);

  async function handleCreatePost() {
    if (!title || !content) return;
    setSubmitting(true);
    const res = await fetch(`${API}/api/groups/${groupId}/posts`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts(prev => [data.post, ...prev]);
      setTitle(''); setContent(''); setTags(''); setShowNew(false);
    }
    setSubmitting(false);
  }

  async function handleUpvote(postId: string) {
    const res = await fetch(`${API}/api/groups/${groupId}/posts/${postId}/upvote`, {
      method: 'PATCH', headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) setPosts(prev => prev.map(p => p._id === postId ? data.post : p));
  }

  async function handleReply(postId: string) {
    if (!replyContent) return;
    const res = await fetch(`${API}/api/groups/${groupId}/posts/${postId}/replies`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent }),
    });
    const data = await res.json();
    if (res.ok) { setPosts(prev => prev.map(p => p._id === postId ? data.post : p)); setReplyContent(''); }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Delete this post?')) return;
    await fetch(`${API}/api/groups/${groupId}/posts/${postId}`, { method: 'DELETE', headers: authHeaders() });
    setPosts(prev => prev.filter(p => p._id !== postId));
  }

  async function handlePin(postId: string) {
    const res = await fetch(`${API}/api/groups/${groupId}/posts/${postId}/pin`, { method: 'PATCH', headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setPosts(prev => prev.map(p => p._id === postId ? data.post : p).sort((a, b) => Number(b.isPinned) - Number(a.isPinned)));
  }

  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };

  return (
    <div style={{ ...s, background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ height: 60, background: '#fff', borderBottom: '0.5px solid #E5E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href={`/groups/${groupId}`} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>← Class</Link>
          <span style={{ fontSize: 13, color: '#E5E0D5' }}>/</span>
          <span style={{ fontSize: 13, color: '#111', fontWeight: 600 }}>Discussion</span>
        </div>
        <button onClick={() => setShowNew(!showNew)} style={{ padding: '7px 16px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          + New Post
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>Discussion Forum</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px' }}>Ask questions, share notes, discuss topics.</p>

        {/* New post form */}
        {showNew && (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A4A3C', margin: '0 0 14px' }}>New Post</h3>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title…"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, marginBottom: 10, outline: 'none', boxSizing: 'border-box' as const }} />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your question or note…" rows={4}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, resize: 'none', marginBottom: 10, outline: 'none', boxSizing: 'border-box' as const }} />
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated, e.g. DBMS, SQL)"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, marginBottom: 14, outline: 'none', boxSizing: 'border-box' as const }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreatePost} disabled={submitting || !title || !content} style={{ padding: '8px 20px', background: '#0A4A3C', color: '#F2B759', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                {submitting ? 'Posting…' : 'Post'}
              </button>
              <button onClick={() => setShowNew(false)} style={{ padding: '8px 16px', background: '#F5F0E8', color: '#6B7280', borderRadius: 8, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No posts yet. Start the discussion!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} style={{ background: '#fff', borderRadius: 14, border: `0.5px solid ${post.isPinned ? '#F2B759' : '#E5E0D5'}`, padding: '18px 20px', marginBottom: 12 }}>
              {/* Post header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {post.isPinned && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(242,183,89,0.15)', color: '#92651a' }}>📌 Pinned</span>}
                    {post.userRole === 'teacher' && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(10,74,60,0.08)', color: '#0A4A3C' }}>Teacher</span>}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>{post.title}</h3>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>by {post.userName} · {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {isTeacher && (
                    <button onClick={() => handlePin(post._id)} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 7, border: '0.5px solid #E5E0D5', background: '#fff', color: '#6B7280', cursor: 'pointer' }}>
                      {post.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {(post.userId === user?._id || isTeacher) && (
                    <button onClick={() => handleDelete(post._id)} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 7, border: '0.5px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px', lineHeight: 1.6 }}>{post.content}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(10,74,60,0.06)', color: '#0A4A3C' }}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => handleUpvote(post._id)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
                  padding: '5px 12px', borderRadius: 20,
                  background: post.upvotes.includes(user?._id || '') ? 'rgba(10,74,60,0.08)' : '#F5F0E8',
                  color: post.upvotes.includes(user?._id || '') ? '#0A4A3C' : '#6B7280',
                  border: 'none', cursor: 'pointer',
                }}>
                  ▲ {post.upvotes.length}
                </button>
                <button onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  💬 {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              </div>

              {/* Replies */}
              {expandedPost === post._id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid #F0EDE8' }}>
                  {post.replies.map(r => (
                    <div key={r._id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#F2B759' }}>{r.userName[0].toUpperCase()}</span>
                      </div>
                      <div style={{ flex: 1, background: '#F9F7F5', borderRadius: 8, padding: '8px 12px' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#0A4A3C', margin: '0 0 2px' }}>{r.userName}</p>
                        <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>{r.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Reply input */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input value={replyContent} onChange={e => setReplyContent(e.target.value)}
                      placeholder="Write a reply…" onKeyDown={e => { if (e.key === 'Enter') handleReply(post._id); }}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 12, outline: 'none' }} />
                    <button onClick={() => handleReply(post._id)} disabled={!replyContent}
                      style={{ padding: '8px 14px', background: '#0A4A3C', color: '#F2B759', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}