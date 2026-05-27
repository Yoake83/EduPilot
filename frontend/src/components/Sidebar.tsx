'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/groups', label: 'My Groups', icon: GroupsIcon },
  { href: '/assignments', label: 'Assignments', icon: AssignmentsIcon },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: ToolkitIcon },
  { href: '/library', label: 'My Library', icon: LibraryIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 248,
      minWidth: 248,
      height: '100vh',
      background: '#fff',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* Logo */}
      <div  style={{ padding: '18px 20px 14px 20px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <defs>
            <linearGradient id="vg" x1="3" y1="1" x2="31" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFB347"/>
              <stop offset="45%" stopColor="#E8620A"/>
              <stop offset="100%" stopColor="#B8001A"/>
            </linearGradient>
          </defs>
          <rect width="34" height="34" rx="8" fill="url(#vg)"/>
          <path d="M9.5 11L17 25L24.5 11" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <span style={{ fontWeight: 700, fontSize: 16.5, color: '#111', letterSpacing: '-0.3px' }}>VedaAI</span>
      </div>

      {/* Create Assignment */}
     {/* Top Action Button */}
<div style={{ padding: '2px 16px 18px 16px' }}>
  <Link
    href={pathname === '/toolkit' ? '/toolkit' : '/assignments/create'}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      padding: '9px 16px',
      borderRadius: 999,
      background: '#1a1a1a',
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      textDecoration: 'none',
      border: '2.5px solid #E8920C',
      boxShadow: '0 0 0 3px rgba(232,146,12,0.15)',
      letterSpacing: '-0.1px',
    }}
  >
    <span style={{ fontSize: 14 }}>✦</span>

    {pathname === '/home'
      ? "AI Teacher's Toolkit"
      : 'Create Assignment'}
  </Link>
</div>
      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 7, marginBottom: 1,
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? '#111' : '#6B7280',
              background: active ? '#F3F4F6' : 'transparent',
              textDecoration: 'none',
            }}>
              <item.icon active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid #E5E7EB', padding: '10px 8px 12px' }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 12px', borderRadius: 7,
          fontSize: 13, color: '#6B7280', textDecoration: 'none', marginBottom: 6,
        }}>
          <SettingsIcon active={false} />
          Settings
        </Link>

        {/* School card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', background: '#F9FAFB',
          borderRadius: 10, border: '1px solid #E5E7EB',
          margin: '0 4px',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #FFD580, #F5A623)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>
            🦊
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Delhi Public School
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#111' : '#9CA3AF';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 6.5L8 2L14 6.5V14C14 14.276 13.776 14.5 13.5 14.5H2.5C2.224 14.5 2 14.276 2 14V6.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M6 14.5V9.5H10V14.5" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

function GroupsIcon({ active }: { active: boolean }) {
  const c = active ? '#111' : '#9CA3AF';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="5.5" r="2.5" stroke={c} strokeWidth="1.4"/>
      <path d="M1 13.5C1 11.3 3.2 9.5 6 9.5C8.8 9.5 11 11.3 11 13.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 4C12.4 4 13.5 5.1 13.5 6.5C13.5 7.9 12.4 9 11 9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12.5 12.5C13.5 12.5 15 13 15 14.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function AssignmentsIcon({ active }: { active: boolean }) {
  const c = active ? '#111' : '#9CA3AF';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke={c} strokeWidth="1.4"/>
      <path d="M4.5 5.5H11.5M4.5 8H11.5M4.5 10.5H8.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function ToolkitIcon({ active }: { active: boolean }) {
  const c = active ? '#111' : '#9CA3AF';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="7.5" width="14" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/>
      <path d="M5 7.5V6C5 4.067 6.567 2.5 8.5 2.5C10.433 2.5 12 4.067 12 6V7.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  const c = active ? '#111' : '#9CA3AF';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.5 2.5V13.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2.5 2.5L6.5 4.5V13.5L2.5 11.5V2.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M6.5 4.5L10.5 2.5V11.5L6.5 13.5V4.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? '#111' : '#9CA3AF';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.4"/>
      <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.1 3.1L4.2 4.2M11.8 11.8L12.9 12.9M3.1 12.9L4.2 11.8M11.8 4.2L12.9 3.1" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}