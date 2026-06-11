'use client';

import { useEffect, useRef } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  'wss://edupilot-dmy4.onrender.com';

export function useAssignmentWebSocket(assignmentId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const { updateAssignmentResult, updateAssignmentStatus, setGenerationProgress } =
    useAssignmentStore();

  useEffect(() => {
    if (!assignmentId) return;

    const ws = new WebSocket(`${WS_URL}/ws?assignmentId=${assignmentId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'job:progress':
            setGenerationProgress(msg.payload.progress);
            break;
          case 'job:completed':
            setGenerationProgress(100);
            updateAssignmentResult(assignmentId, msg.payload.result);
            break;
          case 'job:failed':
            updateAssignmentStatus(assignmentId, 'failed');
            break;
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onerror = (e) => console.error('WS error', e);

    return () => {
      ws.close();
    };
  }, [assignmentId]);

  return wsRef;
}
