
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { format } from 'date-fns';

export default function AssignmentsPage() {
  const { assignments, isLoading, fetchAssignments, deleteAssignment } = useAssignmentStore();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = assignments.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' ? true : a.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15V16H9V21H4C3.4 21 3 20.6 3 20V10.5Z"
            stroke="white" strokeWidth="1.6" strokeLinejoin="round"
            strokeOpacity={active ? '1' : '0.5'}
          />
        </svg>
      ),
    },
    {
      href: '/assignments',
      label: 'Assignments',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="13" height="16" rx="2" stroke="white" strokeWidth="1.6"
            strokeOpacity={active ? '1' : '0.5'} />
          <path d="M8 8h6M8 12h4" stroke="white" strokeWidth="1.6" strokeLinecap="round"
            strokeOpacity={active ? '1' : '0.5'} />
        </svg>
      ),
    },
    {
      href: '/library',
      label: 'Library',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13" stroke="white" strokeWidth="1.6"
            strokeOpacity={active ? '1' : '0.5'} />
          <path d="M4 19a2 2 0 002 2h12a2 2 0 002-2" stroke="white" strokeWidth="1.6"
            strokeOpacity={active ? '1' : '0.5'} />
          <path d="M9 10h6M9 14h4" stroke="white" strokeWidth="1.6" strokeLinecap="round"
            strokeOpacity={active ? '1' : '0.5'} />
        </svg>
      ),
    },
    {
      href: '/toolkit',
      label: 'AI Toolkit',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3l1.5 4.5H18l-3.75 2.7 1.5 4.5L12 12l-3.75 2.7 1.5-4.5L6 7.5h4.5L12 3z"
            stroke="white" strokeWidth="1.5" strokeLinejoin="round"
            strokeOpacity={active ? '1' : '0.5'}
          />
          <circle cx="19" cy="18" r="2" stroke="white" strokeWidth="1.4"
            strokeOpacity={active ? '1' : '0.5'} />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5] font-sans overflow-hidden">

      {/* ── Top Navbar ── */}
      <div className="h-[72px] bg-white border-b border-[#ECECEC] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 bg-white border border-[#ECECEC] rounded-xl px-3 py-2 shadow-sm">
            <div className="w-5 h-5 rounded bg-black text-white flex items-center justify-center text-[10px] font-bold">V</div>
            <span className="text-[15px] font-semibold">VedaAI</span>
          </div>
          {/* Desktop breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm text-[#9CA3AF]">
            <span>Assignment</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M4.5 8.5C4.5 5.5 7.4 3 11 3C14.6 3 17.5 5.5 17.5 8.5V14L19 16H3L4.5 14V8.5Z"
                stroke="#555" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FF5A1F]" />
          </div>

          {/* Desktop profile */}
          <div className="hidden md:flex items-center gap-3 bg-white border border-[#ECECEC] rounded-2xl px-2.5 py-1.5 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[11px] font-semibold text-[#444]">JD</div>
            <span className="text-[14px] font-medium text-[#2F2F2F]">John Doe</span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M5 8L10 13L15 8" stroke="#8B8B8B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Mobile avatar */}
          <button className="md:hidden w-9 h-9 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[11px] font-semibold text-[#444] border border-[#ECECEC]">
            JD
          </button>

          {/* Hamburger */}
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7H20" stroke="#111" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12H20" stroke="#111" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17H20" stroke="#111" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
          <div style={{
            width: 28, height: 28,
            border: '3px solid #F5A623',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-auto bg-[#F2F2F2]">

          {/* ── Page Header ── */}
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight tracking-tight">
              Assignments
            </h1>
            <p className="text-[13px] text-[#9CA3AF] mt-1">
              Manage and create assignments for your classes.
            </p>
          </div>

          <div className="px-4 md:px-6 py-4">

            {/* ── Filter + Search Bar ── */}
            <div className="flex items-center justify-between bg-white border border-[#E0E0E0] rounded-2xl px-5 h-[52px] mb-5">

              {/* Filter By */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 text-[13px] text-[#555] font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M4 8h8M6 12h4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Filter By
              </button>

              {/* Search pill */}
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="#B0B0B0" strokeWidth="1.3" />
                  <path d="M10.5 10.5L13.5 13.5" stroke="#B0B0B0" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Assignment"
                  className="h-[36px] w-[180px] md:w-[220px] rounded-full border border-[#E4E4E4] bg-[#FAFAFA] pl-9 pr-4 text-[13px] text-[#333] placeholder:text-[#C0C0C0] outline-none focus:border-[#BDBDBD]"
                />
              </div>
            </div>

            {/* ── Cards Grid ── */}
            <div
              ref={menuRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-36"
            >
              {filtered.map((a) => (
                <div
                  key={a._id}
                  className="bg-white rounded-[20px] border border-[#ECECEC] px-5 py-5 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] transition-all"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-[16px] md:text-[17px] font-bold text-[#1A1A1A] leading-snug flex-1 pr-3">
                      {a.title}
                    </span>

                    <div className="relative flex-shrink-0">
                      <button
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === a._id ? null : a._id);
                        }}
                        className="text-[#9CA3AF] text-[20px] px-1 leading-none flex items-center"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        ⋮
                      </button>

                      {/* Dropdown */}
                      {menuOpenId === a._id && (
                        <div
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 36,
                            background: '#fff',
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
                            zIndex: 100,
                            minWidth: 180,
                            overflow: 'hidden',
                            border: 'none',
                            padding: '6px 0',
                          }}
                        >
                          <button
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(null);
                              router.push(`/assignments/${a._id}`);
                            }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '12px 20px', fontSize: 14, fontWeight: 500,
                              color: '#111', background: 'none', border: 'none', cursor: 'pointer',
                            }}
                          >
                            View Assignment
                          </button>
                          <div style={{ height: 1, background: '#F0F0F0', margin: '0 14px' }} />
                          <button
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              deleteAssignment(a._id);
                              setMenuOpenId(null);
                            }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '12px 20px', fontSize: 14, fontWeight: 500,
                              color: '#E53535', background: 'none', border: 'none', cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates row */}
                  <div className="flex items-center gap-5 text-[13px] text-[#555]">
                    <span>
                      <span className="font-bold text-[#1A1A1A]">Assigned on :</span>{' '}
                      {format(new Date(a.createdAt), 'dd-MM-yyyy')}
                    </span>
                    <span>
                      <span className="font-bold text-[#1A1A1A]">Due :</span>{' '}
                      {format(new Date(a.dueDate), 'dd-MM-yyyy')}
                    </span>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-[#9CA3AF] text-[13px]">
                  No assignments match your search or filter.
                </div>
              )}
            </div>
          </div>

          {/* ── Desktop Create FAB ── */}
          <Link
            href="/assignments/create"
            className="hidden md:flex fixed bottom-7 left-[calc(50%+135px)] -translate-x-1/2 h-[48px] px-8 bg-black text-white rounded-full items-center justify-center text-[13px] font-semibold shadow-[0_6px_18px_rgba(0,0,0,0.22)] z-40 gap-1"
          >
            + Create Assignment
          </Link>

          {/* ── Mobile Create FAB ── */}
          <Link
            href="/assignments/create"
            className="md:hidden fixed bottom-[88px] right-5 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.16)] z-50 border border-[#ECECEC]"
          >
            <span className="text-[28px] text-[#FF7A00] leading-none mb-[2px]">+</span>
          </Link>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-black flex items-center justify-around md:hidden z-50 rounded-t-[24px] px-3">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-2xl transition-all ${
                active ? 'bg-white/20 px-4 py-1.5' : 'px-3 py-1 opacity-60'
              }`}
            >
              {icon(active)}
              <span className={`text-[10px] text-white ${active ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Mobile Sidebar ── */}
      <div
        className={`fixed top-0 left-0 h-screen w-[260px] bg-white z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#ECECEC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">V</div>
            <span className="font-semibold text-[16px]">VedaAI</span>
          </div>
          <button onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="flex flex-col p-4 gap-2">
          <Link href="/" className="px-4 py-3 rounded-xl text-[#555]">Home</Link>
          <Link href="/assignments" className="px-4 py-3 rounded-xl bg-black text-white">Assignments</Link>
          <Link href="/library" className="px-4 py-3 rounded-xl text-[#555]">Library</Link>
          <Link href="/toolkit" className="px-4 py-3 rounded-xl text-[#555]">AI Toolkit</Link>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-[90] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F2F2F2] px-6 text-center">
      <div style={{ marginBottom: 20 }}>
        <svg width="160" height="145" viewBox="0 0 210 190" fill="none">
          <circle cx="105" cy="95" r="74" fill="#E8E5F4" opacity="0.55" />
          <rect x="122" y="20" width="60" height="40" rx="7" fill="white" opacity="0.92" />
          <rect x="131" y="30" width="22" height="4" rx="2" fill="#D1D5DB" />
          <rect x="131" y="39" width="34" height="4" rx="2" fill="#E5E7EB" />
          <circle cx="162" cy="30" r="5" fill="#E5E7EB" />
          <rect x="54" y="34" width="82" height="98" rx="9" fill="white" />
          <rect x="66" y="54" width="58" height="6" rx="3" fill="#1A1A2E" />
          <rect x="66" y="67" width="58" height="4" rx="2" fill="#E5E7EB" />
          <rect x="66" y="77" width="50" height="4" rx="2" fill="#E5E7EB" />
          <rect x="66" y="87" width="54" height="4" rx="2" fill="#E5E7EB" />
          <rect x="66" y="97" width="42" height="4" rx="2" fill="#E5E7EB" />
          <rect x="66" y="107" width="48" height="4" rx="2" fill="#E5E7EB" />
          <path d="M42 48 C32 32, 58 16, 68 32" stroke="#7C73C0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="122" cy="116" r="36" fill="#EDE9FB" />
          <circle cx="122" cy="116" r="36" stroke="#C4BFEF" strokeWidth="2" fill="none" />
          <line x1="148" y1="142" x2="163" y2="157" stroke="#9B94DD" strokeWidth="7" strokeLinecap="round" />
          <circle cx="122" cy="116" r="25" fill="white" opacity="0.5" />
          <path d="M110 104L134 128M134 104L110 128" stroke="#EF4444" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M54 148 L57.5 140 L61 148 L57.5 156 Z" fill="#7C73C0" opacity="0.65" />
          <path d="M30 78 L32.5 73 L35 78 L32.5 83 Z" fill="#7C73C0" opacity="0.45" />
          <circle cx="166" cy="102" r="5.5" fill="#3B82F6" opacity="0.55" />
        </svg>
      </div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 8px 0', textAlign: 'center' }}>
        No assignments yet
      </h2>
      <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', maxWidth: 280, lineHeight: 1.65, margin: '0 0 24px 0' }}>
        Create your first assignment to start collecting and grading student submissions. You can set
        up rubrics, define marking criteria, and let AI assist with grading.
      </p>
    </div>
  );
}
