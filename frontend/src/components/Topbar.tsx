'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from './NotificationBell';
interface TopbarProps { title: string; action?: { label: string; href?: string; onClick?: () => void; }; }
export function Topbar({ title, action }: TopbarProps) {
 const { user } = useAuth();
 const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'E';
 return <header className="topbar"><div className="topbar-breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>{title}</strong></div><div className="topbar-actions"><NotificationBell/>{action && (action.href ? <Link className="button button-primary topbar-cta" href={action.href}>{action.label}</Link> : <button className="button button-primary topbar-cta" onClick={action.onClick}>{action.label}</button>)}<span className="avatar" title={user?.name}>{initials}</span></div></header>;
}
