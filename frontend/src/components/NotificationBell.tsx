'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(user?._id);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const typeIcon: Record<string, string> = {
    new_assignment: '📄',
    assignment_graded: '✅',
    submission_received: '📥',
    new_announcement: '📢',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}
      >
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <path d="M4.5 8.5C4.5 5.5 7.4 3 11 3C14.6 3 17.5 5.5 17.5 8.5V14L19 16H3L4.5 14V8.5Z"
            stroke="#555" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 16C9 17.1 9.9 18 11 18C12.1 18 13 17.1 13 16" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 16, height: 16, borderRadius: '50%',
            background: '#F2B759', color: '#0A4A3C',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36,
          width: 320, background: '#fff',
          borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '0.5px solid #E5E0D5', zIndex: 200, overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid #F0EDE8' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0A4A3C' }}>
              Notifications {unreadCount > 0 && <span style={{ fontSize: 11, color: '#F2B759' }}>({unreadCount} new)</span>}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 11, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => {
                    markRead(n._id);
                    if (n.link) router.push(n.link);
                    setOpen(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '0.5px solid #F9F7F5',
                    background: n.read ? '#fff' : 'rgba(242,183,89,0.06)',
                    cursor: n.link ? 'pointer' : 'default',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon[n.type] || '🔔'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>
                      {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F2B759', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}