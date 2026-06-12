'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from './NotificationBell';

interface TopbarProps {
  title: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function Topbar({ title, action }: TopbarProps) {
  const { user } = useAuth();

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div style={{
      height: 60, background: '#fff',
      borderBottom: '0.5px solid #E5E0D5',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 30,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Left — breadcrumb */}
      <span style={{ fontSize: 13, color: '#9CA3AF' }}>{title}</span>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification Bell */}
        <NotificationBell />

        {/* Action button */}
        {action && (
          action.href ? (
            <Link href={action.href} style={{
              padding: '7px 16px', background: '#0A4A3C', color: '#F2B759',
              borderRadius: 999, fontSize: 12, fontWeight: 700, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} style={{
              padding: '7px 16px', background: '#0A4A3C', color: '#F2B759',
              borderRadius: 999, fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer',
            }}>
              {action.label}
            </button>
          )
        )}

        {/* Profile pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F5F0E8', borderRadius: 20,
          padding: '5px 10px 5px 5px',
          border: '0.5px solid #E5E0D5',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#0A4A3C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#F2B759',
          }}>
            {user ? getInitials(user.name) : '?'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#2F2F2F' }}>
            {user?.name?.split(' ')[0] ?? ''}
          </span>
        </div>
      </div>
    </div>
  );
}