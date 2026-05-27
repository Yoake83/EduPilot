'use client';

import Link from 'next/link';

const tools = [
  {
    icon: '📝',
    title: 'Question Generator',
    desc: 'Generate AI-powered question papers for any subject and grade',
    href: '/assignments/create',
    available: true,
  },
  {
    icon: '📊',
    title: 'Rubric Builder',
    desc: 'Create detailed grading rubrics with AI assistance',
    href: null,
    available: false,
  },
  {
    icon: '✅',
    title: 'Auto Grader',
    desc: 'Grade student submissions automatically',
    href: null,
    available: false,
  },
  {
    icon: '📈',
    title: 'Performance Analytics',
    desc: 'Track student performance over time',
    href: null,
    available: false,
  },
  {
    icon: '🎯',
    title: 'Lesson Planner',
    desc: 'Plan lessons aligned to curriculum standards',
    href: null,
    available: false,
  },
  {
    icon: '💬',
    title: 'Feedback Generator',
    desc: 'Generate personalized feedback for students',
    href: null,
    available: false,
  },
];

export default function ToolkitPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '16px 24px' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>AI Teacher's Toolkit</h1>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>Powerful AI tools to supercharge your teaching</p>
      </div>

      <div style={{ flex: 1, overflow: 'auto', background: '#F2F2F2', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {tools.map((tool) => (
            <div
              key={tool.title}
              style={{
                background: '#fff', borderRadius: 14,
                border: tool.available ? '1.5px solid #111' : '1px solid #EBEBEB',
                padding: '24px 20px', position: 'relative',
              }}
            >
              {tool.available && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: '#111', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                  LIVE
                </div>
              )}
              <div style={{ fontSize: 32, marginBottom: 12 }}>{tool.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>{tool.title}</p>
              <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: 0, lineHeight: 1.5 }}>{tool.desc}</p>

              {tool.available && tool.href ? (
                <Link
                  href={tool.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginTop: 16, padding: '8px 16px',
                    background: '#111', color: '#fff',
                    borderRadius: 8, fontSize: 12, fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Open Tool →
                </Link>
              ) : (
                <button style={{ marginTop: 16, padding: '7px 16px', background: '#F3F4F6', color: '#9CA3AF', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'not-allowed' }}>
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}