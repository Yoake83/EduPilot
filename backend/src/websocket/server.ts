import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WSMessage } from '../types';

// Map: assignmentId → Set of connected clients
const rooms = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const assignmentId = url.searchParams.get('assignmentId');

    if (assignmentId) {
      if (!rooms.has(assignmentId)) rooms.set(assignmentId, new Set());
      rooms.get(assignmentId)!.add(ws);

      ws.on('close', () => {
        rooms.get(assignmentId)?.delete(ws);
        if (rooms.get(assignmentId)?.size === 0) rooms.delete(assignmentId);
      });
    }

    ws.on('error', console.error);
  });

  console.log('WebSocket server initialized');
}

export function broadcastToAssignment(assignmentId: string, message: WSMessage) {
  const clients = rooms.get(assignmentId);
  if (!clients) return;

  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
