'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Material {
  _id: string;
  title: string;
  fileName: string;
  fileSize: number;
  subject?: string;
  uploaderName: string;
  uploaderRole: string;
 uploadedBy?: string;
  totalChunks: number;
  groupId?: string;
  createdAt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

export default function StudyPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/api/study`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setMaterials(d.materials || []))
      .catch(console.error);
  }, [mounted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;
    setUploading(true);
    setUploadError('');

    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('title', uploadTitle);
    if (uploadSubject) fd.append('subject', uploadSubject);

    try {
      const res = await fetch(`${API}/api/study/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setMaterials(prev => [data.material, ...prev]);
      setUploadTitle(''); setUploadSubject(''); setUploadFile(null);
      setShowUpload(false);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk() {
    if (!input.trim() || !selectedMaterial || asking) return;
    const question = input.trim();
    setInput('');
    setAsking(true);

    setMessages(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '', loading: true },
    ]);

    try {
      const res = await fetch(`${API}/api/study/ask`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: selectedMaterial._id, question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: 'assistant', content: data.answer, loading: false } : m
      ));
    } catch (err: any) {
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { role: 'assistant', content: `Error: ${err.message}`, loading: false } : m
      ));
    } finally {
      setAsking(false);
    }
  }

  function handleSelectMaterial(m: Material) {
    setSelectedMaterial(m);
    setMessages([{
      role: 'assistant',
      content: `📚 I've loaded **${m.title}** (${m.totalChunks} sections indexed). Ask me anything about this material and I'll answer only from what's in your notes!`,
    }]);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this material?')) return;
    await fetch(`${API}/api/study/${id}`, { method: 'DELETE', headers: authHeaders() });
    setMaterials(prev => prev.filter(m => m._id !== id));
    if (selectedMaterial?._id === id) { setSelectedMaterial(null); setMessages([]); }
  }

  const s = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E5E0D5', fontSize: 13, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const };

  const SUGGESTIONS = [
    'Summarize the key concepts',
    'What are the main topics covered?',
    'Explain the most important points',
    'Give me 5 practice questions from this',
  ];

  return (
    <div style={{ ...s, background: '#F5F0E8', minHeight: '100vh' }}>
      <Topbar title="Study Assistant" />

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

        {/* LEFT PANEL — Materials list */}
        <div style={{ width: 280, minWidth: 280, background: '#fff', borderRight: '0.5px solid #E5E0D5', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '0.5px solid #F0EDE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0A4A3C', margin: 0 }}>Study Materials</h2>
              <button onClick={() => setShowUpload(!showUpload)} style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                background: '#0A4A3C', color: '#F2B759', border: 'none', cursor: 'pointer',
              }}>
                + Upload
              </button>
            </div>

            {/* Upload form */}
            {showUpload && (
              <form onSubmit={handleUpload} style={{ background: '#F9F7F5', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                {uploadError && (
                  <div style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 6, padding: '6px 8px', fontSize: 11, marginBottom: 8 }}>
                    {uploadError}
                  </div>
                )}
                <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
                  placeholder="Title (e.g. Unit 3 Notes)" required style={{ ...inputStyle, marginBottom: 6, fontSize: 12 }} />
                <input value={uploadSubject} onChange={e => setUploadSubject(e.target.value)}
                  placeholder="Subject (optional)" style={{ ...inputStyle, marginBottom: 6, fontSize: 12 }} />
                <input ref={fileInputRef} type="file" accept=".pdf"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                <div onClick={() => fileInputRef.current?.click()}
                  style={{ border: '1.5px dashed #E5E0D5', borderRadius: 7, padding: '8px 10px', cursor: 'pointer', marginBottom: 8, textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: uploadFile ? '#0A4A3C' : '#9CA3AF', margin: 0, fontWeight: uploadFile ? 600 : 400 }}>
                    {uploadFile ? `📄 ${uploadFile.name}` : '📎 Click to choose PDF'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="submit" disabled={uploading || !uploadFile || !uploadTitle} style={{
                    flex: 1, padding: '7px 0', borderRadius: 7, background: !uploadFile || !uploadTitle ? '#9CA3AF' : '#0A4A3C',
                    color: '#F2B759', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                  }}>
                    {uploading ? 'Processing…' : 'Upload'}
                  </button>
                  <button type="button" onClick={() => setShowUpload(false)} style={{ padding: '7px 10px', borderRadius: 7, background: '#fff', color: '#6B7280', fontSize: 12, border: '0.5px solid #E5E0D5', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Materials list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
            {materials.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📚</div>
                <p style={{ fontSize: 12, margin: 0 }}>Upload your first PDF to get started</p>
              </div>
            ) : (
              materials.map(m => (
                <div key={m._id}
                  onClick={() => handleSelectMaterial(m)}
                  style={{
                    padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                    background: selectedMaterial?._id === m._id ? 'rgba(10,74,60,0.08)' : 'transparent',
                    border: `0.5px solid ${selectedMaterial?._id === m._id ? 'rgba(10,74,60,0.2)' : 'transparent'}`,
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: selectedMaterial?._id === m._id ? '#0A4A3C' : '#111', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.title}
                      </p>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>
                        {m.subject || m.fileName} · {m.totalChunks} sections
                      </p>
                      {m.uploaderRole === 'teacher' && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: 'rgba(10,74,60,0.08)', color: '#0A4A3C' }}>Teacher</span>
                      )}
                    </div>
                    {m.uploadedBy === user?._id && (
                      <button onClick={e => { e.stopPropagation(); handleDelete(m._id); }}
                        style={{ fontSize: 10, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!selectedMaterial ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
                🧠
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0A4A3C', margin: '0 0 8px' }}>AI Study Assistant</h2>
              <p style={{ fontSize: 13, color: '#6B7280', maxWidth: 360, lineHeight: 1.6, margin: '0 0 24px' }}>
                Upload your notes or textbook PDFs, then ask questions. The AI will answer <strong>only from your material</strong> — like having a tutor who's read your notes.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 400 }}>
                {['Upload lecture notes', 'Ask about any topic', 'Get summaries', 'Practice questions'].map(tip => (
                  <div key={tip} style={{ padding: '10px 14px', background: '#fff', borderRadius: 10, border: '0.5px solid #E5E0D5', fontSize: 12, color: '#374151', fontWeight: 500 }}>
                    ✓ {tip}
                  </div>
                ))}
              </div>
              {materials.length === 0 && (
                <button onClick={() => setShowUpload(true)} style={{ marginTop: 20, padding: '10px 24px', background: '#0A4A3C', color: '#F2B759', borderRadius: 999, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Upload Your First PDF
                </button>
              )}
              {materials.length > 0 && (
                <p style={{ marginTop: 16, fontSize: 13, color: '#9CA3AF' }}>← Select a material to start chatting</p>
              )}
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '14px 20px', background: '#fff', borderBottom: '0.5px solid #E5E0D5', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(10,74,60,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📄</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{selectedMaterial.title}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{selectedMaterial.totalChunks} sections indexed · Answers from your material only</p>
                </div>
                <button onClick={() => { setSelectedMaterial(null); setMessages([]); }}
                  style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: 'flex-start', marginTop: 2 }}>
                        🧠
                      </div>
                    )}
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px', 
                      background: msg.role === 'user' ? '#0A4A3C' : '#fff',
                      color: msg.role === 'user' ? '#F2B759' : '#111',
                      border: msg.role === 'assistant' ? '0.5px solid #E5E0D5' : 'none',
                      fontSize: 13, lineHeight: 1.6,
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                    }}>
                      {msg.loading ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {[0, 1, 2].map(i => (
                            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: `${i * 0.15}s` }} />
                          ))}
                          <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                ))}

                {/* Suggestions — show when no messages yet except welcome */}
                {messages.length === 1 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => { setInput(s); }}
                        style={{ fontSize: 12, padding: '7px 14px', borderRadius: 20, background: '#fff', color: '#0A4A3C', border: '0.5px solid #E5E0D5', cursor: 'pointer', fontWeight: 500 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 20px', background: '#fff', borderTop: '0.5px solid #E5E0D5' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#F9F7F5', borderRadius: 12, padding: '8px 12px', border: '0.5px solid #E5E0D5' }}>
                  <textarea
                    value={input}
                    onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
                    placeholder={`Ask anything about "${selectedMaterial.title}"…`}
                    rows={1}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#111', resize: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto' }}
                  />
                  <button onClick={handleAsk} disabled={!input.trim() || asking}
                    style={{ width: 32, height: 32, borderRadius: 8, background: !input.trim() || asking ? '#E5E0D5' : '#0A4A3C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 13V3M4 7l4-4 4 4" stroke={!input.trim() || asking ? '#9CA3AF' : '#F2B759'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <p style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', margin: '6px 0 0' }}>
                  Answers are based only on your uploaded material
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}