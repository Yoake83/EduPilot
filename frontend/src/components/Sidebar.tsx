'use client';
import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
export default function Sidebar() {
 const pathname = usePathname();
 const { user, logout } = useAuth();
 const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
 const items = [
  { href: '/home', label: 'Overview', icon: HomeIcon },
  { href: '/groups', label: 'My classes', icon: GroupsIcon },
  { href: '/assignments', label: 'Assignments', icon: AssignmentsIcon },
  ...(isTeacher ? [{ href: '/toolkit', label: 'AI teaching toolkit', icon: ToolkitIcon }] : []),
  { href: '/library', label: 'My library', icon: LibraryIcon },
  { href: '/study', label: 'Study assistant', icon: StudyIcon },
  { href: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
 ];
 const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'E';
 return <aside className="app-sidebar">
  <Link href="/home" className="sidebar-brand"><Brand/></Link>
  <p className="nav-caption">YOUR WORKSPACE</p>
  <nav aria-label="Main navigation" className="main-nav">{items.map(item => {
   const active = pathname === item.href || pathname.startsWith(item.href + '/');
   return <Link key={item.href} href={item.href} className={`nav-item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}><item.icon active={active}/>{item.label}{active && <span className="nav-dot"/>}</Link>;
  })}</nav>
  <div className="sidebar-prompt"><span className="spark-icon">✦</span><h3>{isTeacher ? 'Make room for teaching.' : 'One step closer.'}</h3><p>{isTeacher ? 'Let AI help with the preparation. You bring the inspiration.' : 'Your next great idea starts with a question.'}</p><Link className="button button-primary" href={isTeacher ? '/assignments/create' : '/groups/join'}>{isTeacher ? '+ Create assignment' : '+ Join a class'}</Link></div>
  <Link className="nav-item" href="/settings"><SettingsIcon active={pathname === '/settings'}/>Settings</Link>
  <div className="sidebar-account"><span className="avatar">{initials}</span><div><strong>{user?.name || 'Your workspace'}</strong><small>{user?.role || 'Student'}</small></div><button className="icon-button" onClick={logout} aria-label="Sign out"><SignOutIcon/></button></div>
 </aside>;
}
function SignOutIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2H3C2.448 2 2 2.448 2 3V13C2 13.552 2.448 14 3 14H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 5L14 8L11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function SubmitIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M13 10v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2 6.5L8 2L14 6.5V14C14 14.276 13.776 14.5 13.5 14.5H2.5C2.224 14.5 2 14.276 2 14V6.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 14.5V9.5H10V14.5" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>;
}
function GroupsIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="6" cy="5.5" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M1 13.5C1 11.3 3.2 9.5 6 9.5C8.8 9.5 11 11.3 11 13.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M11 4C12.4 4 13.5 5.1 13.5 6.5C13.5 7.9 12.4 9 11 9" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M12.5 12.5C13.5 12.5 15 13 15 14.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function AssignmentsIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><rect x="2" y="1" width="12" height="14" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M4.5 5.5H11.5M4.5 8H11.5M4.5 10.5H8.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function ToolkitIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><rect x="1" y="7.5" width="14" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M5 7.5V6C5 4.067 6.567 2.5 8.5 2.5C10.433 2.5 12 4.067 12 6V7.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function LibraryIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2.5 2.5V13.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><path d="M2.5 2.5L6.5 4.5V13.5L2.5 11.5V2.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M6.5 4.5L10.5 2.5V11.5L6.5 13.5V4.5Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>;
}
function SettingsIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.4"/><path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.1 3.1L4.2 4.2M11.8 11.8L12.9 12.9M3.1 12.9L4.2 11.8M11.8 4.2L12.9 3.1" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}

function AnalyticsIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2 12L5.5 8L8.5 10L12 5L14 7" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14H14" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}

function StudyIcon({ active }: { active: boolean }) {
  const c = active ? '#315ED8' : '#69758A';
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M8 2L14 5V11L8 14L2 11V5L8 2Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 2V14M2 5L8 8L14 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
