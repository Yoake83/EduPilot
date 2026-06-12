'use client';

import { useEffect, useRef, useState } from 'react';
import { authHeaders, getToken } from './useApi';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch existing notifications
  useEffect(() => {
    if (!mounted || !userId) return;
    fetch(`${API}/api/notifications`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      })
      .catch(console.error);
  }, [mounted, userId]);

  // Connect WebSocket for real-time notifications
  useEffect(() => {
    if (!mounted || !userId) return;

    const ws = new WebSocket(`${WS_URL}/ws?userId=${userId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'notification') {
          setNotifications(prev => [msg.payload, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onerror = () => {}; // silently handle
    return () => ws.close();
  }, [mounted, userId]);

  async function markAllRead() {
    await fetch(`${API}/api/notifications/all/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  async function markRead(id: string) {
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  return { notifications, unreadCount, markAllRead, markRead };
}