import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WSMessage } from '../types';

const rooms = new Map<string, Set<WebSocket>>();
const userSockets = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const assignmentId = url.searchParams.get('assignmentId');
    const userId = url.searchParams.get('userId');

    if (assignmentId) {
      if (!rooms.has(assignmentId)) rooms.set(assignmentId, new Set());
      rooms.get(assignmentId)!.add(ws);
      ws.on('close', () => {
        rooms.get(assignmentId)?.delete(ws);
        if (rooms.get(assignmentId)?.size === 0) rooms.delete(assignmentId);
      });
    }

    if (userId) {
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId)!.add(ws);
      ws.on('close', () => {
        userSockets.get(userId)?.delete(ws);
        if (userSockets.get(userId)?.size === 0) userSockets.delete(userId);
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
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

export function broadcastToUser(userId: string, message: object) {
  const clients = userSockets.get(userId);
  if (!clients) return;
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

export function broadcastToGroup(studentIds: string[], message: object) {
  studentIds.forEach((userId) => broadcastToUser(userId, message));
}