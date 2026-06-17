'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { authHeaders } from '@/hooks/useApi';
import { Topbar } from '@/components/Topbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data, color = '#0A4A3C' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>{d.value > 0 ? d.value : ''}</span>
          <div style={{ width: '100%', background: color, borderRadius: '4px 4px 0 0', height: `${(d.value / max) * 85}%`, minHeight: d.value > 0 ? 4 : 0, opacity: 0.85 }} />
          <span style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Horizontal bar ─────────────────────────────────────────────────────────────
function HBar({ label, value, max, color = '#0A4A3C', suffix = '%' }: { label: string; value: number; max: number; color?: string; suffix?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 8, background: '#F5F0E8', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ── Donut chart ────────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 13 }}>No data yet</div>;

  let offset = 0;
  const r = 50, cx = 60, cy = 60, circ = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F5F0E8" strokeWidth="18" />
        {data.map((d, i) => {
          if (d.value === 0) return null;
          const pct = d.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += pct;
          return seg;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0A4A3C">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9CA3AF">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#374151' }}>{d.label}: <strong>{d.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#0A4A3C' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '0.5px solid #E5E0D5' }}>
      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color, margin: '0 0 2px' }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 11, color: '#F2B759', margin: 0, fontWeight: 600 }}>{sub}</p>}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #E5E0D5', padding: '20px 24px', marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0A4A3C', margin: '0 0 18px' }}>{title}</h2>
      {children}
    </div>
  );
}

// ── Teacher Analytics ─────────────────────────────────────────────────────────
function TeacherAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/api/analytics/teacher`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mounted]);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading analytics…</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: 40, color: '#DC2626' }}>Failed to load analytics</div>;

  const { overview, submissionsByAssignment, gradeDistribution, submissionsOverTime, groupStats } = data;

  return (
    <>
      {/* Overview stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label="Total Groups" value={overview.totalGroups} sub="active classes" />
        <StatCard label="Total Students" value={overview.totalStudents} sub="across all groups" />
        <StatCard label="Assignments" value={overview.totalAssignments} sub={`${overview.totalSubmissions} submissions`} />
        <StatCard label="Avg Grade" value={overview.overallAvgGrade !== null ? `${overview.overallAvgGrade}%` : '—'} sub={`${overview.submissionRate}% submission rate`} color="#F2B759" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Submissions over time */}
        <Section title="📈 Submissions This Week">
          <BarChart
            data={submissionsOverTime.map((d: any) => ({ label: d.day, value: d.count }))}
            color="#0A4A3C"
          />
        </Section>

        {/* Grade distribution */}
        <Section title="🎯 Grade Distribution">
          <DonutChart data={[
            { label: '90–100%', value: gradeDistribution.find((d: any) => d.range === '90-100')?.count || 0, color: '#059669' },
            { label: '75–89%',  value: gradeDistribution.find((d: any) => d.range === '75-89')?.count || 0,  color: '#0A4A3C' },
            { label: '60–74%',  value: gradeDistribution.find((d: any) => d.range === '60-74')?.count || 0,  color: '#F2B759' },
            { label: '40–59%',  value: gradeDistribution.find((d: any) => d.range === '40-59')?.count || 0,  color: '#F59E0B' },
            { label: '0–39%',   value: gradeDistribution.find((d: any) => d.range === '0-39')?.count || 0,   color: '#DC2626' },
          ]} />
        </Section>
      </div>

      {/* Submission rate per assignment */}
      <Section title="📄 Assignment Submission Rates">
        {submissionsByAssignment.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No assignments yet</p>
        ) : (
          submissionsByAssignment.map((a: any) => (
            <HBar key={a._id} label={a.title} value={a.submissionRate} max={100} color={a.submissionRate >= 75 ? '#059669' : a.submissionRate >= 50 ? '#F2B759' : '#DC2626'} />
          ))
        )}
      </Section>

      {/* Per group stats */}
      <Section title="👥 Class Performance">
        {groupStats.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No classes yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {groupStats.map((g: any) => (
              <Link key={g._id} href={`/groups/${g._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F9F7F5', borderRadius: 10, border: '0.5px solid #E5E0D5' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0A4A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>📚</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{g.name}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>{g.subject} · {g.students} students · {g.assignments} assignments</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: g.avgGrade !== null ? '#0A4A3C' : '#9CA3AF', margin: 0 }}>
                      {g.avgGrade !== null ? `${g.avgGrade}%` : '—'}
                    </p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>avg grade</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// ── Student Analytics ─────────────────────────────────────────────────────────
function StudentAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    fetch(`${API}/api/analytics/student`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mounted]);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading analytics…</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: 40, color: '#DC2626' }}>Failed to load analytics</div>;

  const { overview, assignmentPerformance, gradeTrend } = data;

  const statusColors: Record<string, string> = {
    graded: '#059669', submitted: '#0A4A3C', under_review: '#F2B759', not_submitted: '#DC2626',
  };

  return (
    <>
      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label="Enrolled Classes" value={overview.enrolledClasses} sub="active groups" />
        <StatCard label="Assignments" value={overview.totalAssignments} sub={`${overview.submitted} submitted`} />
        <StatCard label="Avg Grade" value={overview.avgGrade !== null ? `${overview.avgGrade}%` : '—'} sub={`${overview.graded} graded`} color="#F2B759" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Submission status donut */}
        <Section title="📊 Submission Status">
          <DonutChart data={[
            { label: 'Graded', value: overview.graded, color: '#059669' },
            { label: 'Submitted', value: overview.submitted - overview.graded, color: '#0A4A3C' },
            { label: 'Pending', value: overview.pending, color: '#DC2626' },
          ]} />
        </Section>

        {/* Grade trend */}
        <Section title="📈 Grade Trend">
          {gradeTrend.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No graded submissions yet</p>
          ) : (
            <BarChart
              data={gradeTrend.map((d: any) => ({ label: d.label, value: d.percentage }))}
              color="#F2B759"
            />
          )}
        </Section>
      </div>

      {/* Assignment performance */}
      <Section title="📄 Assignment Performance">
        {assignmentPerformance.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No assignments yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assignmentPerformance.map((a: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F9F7F5', borderRadius: 10, border: '0.5px solid #E5E0D5' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '2px 0 0' }}>{a.subject} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {a.percentage !== null ? (
                    <p style={{ fontSize: 14, fontWeight: 700, color: a.percentage >= 75 ? '#059669' : a.percentage >= 50 ? '#F2B759' : '#DC2626', margin: 0 }}>
                      {a.percentage}%
                    </p>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FEF2F2', color: statusColors[a.status] || '#9CA3AF' }}>
                      {a.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Topbar title="Analytics" />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A4A3C', margin: '0 0 4px' }}>
          {isTeacher ? '📊 Teaching Analytics' : '📊 My Progress'}
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px' }}>
          {isTeacher ? 'Track class performance, submission rates and grade distribution.' : 'Track your submissions, grades and performance over time.'}
        </p>
        {isTeacher ? <TeacherAnalytics /> : <StudentAnalytics />}
      </div>
    </div>
  );
}