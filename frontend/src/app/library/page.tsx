'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAssignmentStore } from '@/store/assignmentStore';
import { format } from 'date-fns';

const categories = ['All', 'Question Papers', 'Rubrics', 'Lesson Plans', 'Resources'];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const { assignments, fetchAssignments } = useAssignmentStore();

  useEffect(() => { fetchAssignments(); }, []);

  const completedPapers = assignments.filter((a) => a.status === 'completed');

  const filtered = completedPapers.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>My Library</h1>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>All your saved resources in one place</p>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library..."
            style={{ padding: '8px 12px 8px 32px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', width: 220 }}
          />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.3"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '0 24px', display: 'flex', gap: 4 }}>
        {categories.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === i ? 600 : 400,
              color: activeTab === i ? '#111' : '#6B7280',
              borderBottom: activeTab === i ? '2px solid #111' : '2px solid transparent',
            }}
          >
            {cat}
            {i === 1 && completedPapers.length > 0 && (
              <span style={{ marginLeft: 6, background: '#111', color: '#fff', borderRadius: 999, fontSize: 10, padding: '1px 6px', fontWeight: 600 }}>
                {completedPapers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', background: '#F2F2F2', padding: 24 }}>
        {(activeTab === 0 || activeTab === 1) && filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {filtered.map((a) => (
              <Link
                key={a._id}
                href={`/assignments/${a._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #EBEBEB',
                  padding: '20px', cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, background: '#F3F4F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
                    📄
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.title}
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 12px' }}>
                    {a.result?.subject} · {a.result?.grade}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {format(new Date(a.createdAt), 'dd MMM yyyy')}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E', background: '#ECFDF5', padding: '2px 8px', borderRadius: 999 }}>
                      Completed
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (activeTab === 0 || activeTab === 1) && filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 48 }}>📚</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>
              {search ? 'No results found' : 'Your library is empty'}
            </p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
              {search ? 'Try a different search term' : 'Generated question papers will appear here'}
            </p>
            {!search && (
              <Link href="/assignments/create" style={{ marginTop: 8, padding: '10px 22px', background: '#111', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Create Assignment
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 48 }}>🚧</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>Coming Soon</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>This section is under development</p>
          </div>
        )}
      </div>
    </div>
  );
}