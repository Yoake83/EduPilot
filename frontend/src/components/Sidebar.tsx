'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const initials = user ? getInitials(user.name) : '?';
  const role = user?.role ?? 'student';

  // Role-based nav items
  const navItems = [
    { href: '/home', label: 'Home', icon: HomeIcon, show: true },
    { href: '/groups', label: isTeacher ? 'My Classes' : 'My Classes', icon: GroupsIcon, show: true },
    { href: '/assignments', label: isTeacher ? 'Assignments' : 'Assignments', icon: AssignmentsIcon, show: true },
    { href: '/toolkit', label: "AI Teacher's Toolkit", icon: ToolkitIcon, show: isTeacher },
    { href: '/library', label: 'My Library', icon: LibraryIcon, show: true },
  { href: '/study', label: 'Study Assistant', icon: StudyIcon, show: true },
  { href: '/analytics', label: 'Analytics', icon: AnalyticsIcon, show: true },
  ].filter(item => item.show);

  const ctaLink = isTeacher ? '/assignments/create' : '/groups/join';
  const ctaLabel = isTeacher ? 'Create Assignment' : 'Join a Class';

  return (
    <aside style={{
      width: 248, minWidth: 248, height: '100vh',
      background: '#0A4A3C', borderRight: 'none',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F2B759', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0A4A3C' }}>E</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>EduPilot</span>
      </div>

      {/* CTA button — changes per role */}
      <div style={{ padding: '0 12px 18px' }}>
        <Link href={ctaLink} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 999,
          background: '#F2B759', color: '#0A4A3C',
          fontSize: 13, fontWeight: 700, textDecoration: 'none',
        }}>
          <span style={{ fontSize: 14 }}>✦</span>
          {ctaLabel}
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 7, marginBottom: 2,
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? '#F2B759' : 'rgba(255,255,255,0.5)',
              background: active ? 'rgba(242,183,89,0.12)' : 'transparent',
              textDecoration: 'none',
            }}>
              <item.icon active={active} />
              {item.label}
            </Link>
          );
        })}

        {/* Student-only: Submit Assignment shortcut */}
        {!isTeacher && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: '0 12px', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions</p>
            <Link href="/assignments" style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 7,
              fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
            }}>
              <SubmitIcon />
              Submit Work
            </Link>
          </div>
        )}

        {/* Teacher-only: quick links */}
        {isTeacher && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', padding: '0 12px', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions</p>
            <Link href="/groups/create" style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 7,
              fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
            }}>
              <GroupsIcon active={false} />
              Create Class
            </Link>
            <Link href="/toolkit" style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 7,
              fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
            }}>
              <ToolkitIcon active={false} />
              Quiz Generator
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px 8px 12px' }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 12px', borderRadius: 7, marginBottom: 6,
          fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
        }}>
          <SettingsIcon active={false} />
          Settings
        </Link>

        {/* User card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '9px 12px', background: 'rgba(255,255,255,0.06)',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', margin: '0 4px',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: '#F2B759', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#0A4A3C',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Loading…'}
            </p>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#F2B759', textTransform: 'capitalize' }}>{role}</span>
          </div>
          <button onClick={logout} title="Sign out" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 5, flexShrink: 0,
            color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F2B759')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
          >
            <SignOutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SignOutIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2H3C2.448 2 2 2.448 2 3V13C2 13.552 2.448 14 3 14H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 5L14 8L11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function SubmitIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M13 10v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round"/><path d="M8 2v8M5 5l3-3 3 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2 6.5L8 2L14 6.5V14C14 14.276 13.776 14.5 13.5 14.5H2.5C2.224 14.5 2 14.276 2 14V6.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 14.5V9.5H10V14.5" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>;
}
function GroupsIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="6" cy="5.5" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M1 13.5C1 11.3 3.2 9.5 6 9.5C8.8 9.5 11 11.3 11 13.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M11 4C12.4 4 13.5 5.1 13.5 6.5C13.5 7.9 12.4 9 11 9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M12.5 12.5C13.5 12.5 15 13 15 14.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function AssignmentsIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><rect x="2" y="1" width="12" height="14" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M4.5 5.5H11.5M4.5 8H11.5M4.5 10.5H8.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function ToolkitIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><rect x="1" y="7.5" width="14" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M5 7.5V6C5 4.067 6.567 2.5 8.5 2.5C10.433 2.5 12 4.067 12 6V7.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function LibraryIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2.5 2.5V13.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M2.5 2.5L6.5 4.5V13.5L2.5 11.5V2.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 4.5L10.5 2.5V11.5L6.5 13.5V4.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>;
}
function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.4"/><path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.1 3.1L4.2 4.2M11.8 11.8L12.9 12.9M3.1 12.9L4.2 11.8M11.8 4.2L12.9 3.1" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}

function AnalyticsIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2 12L5.5 8L8.5 10L12 5L14 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14H14" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}

function StudyIcon({ active }: { active: boolean }) {
  const c = active ? '#F2B759' : 'rgba(255,255,255,0.4)';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M8 2L14 5V11L8 14L2 11V5L8 2Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 2V14M2 5L8 8L14 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}