import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '../middleware/auth.middleware';
import { AssignmentModel } from '../models/Assignment';
import type { WSMessage } from '../types';

const rooms = new Map<string, Set<WebSocket>>();
const userSockets = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const timer = setTimeout(() => ws.close(1008, 'Authentication required'), 5000);
    ws.on('close', () => clearTimeout(timer));
    ws.on('error', console.error);
    ws.once('message', async (raw) => {
      clearTimeout(timer);
      try {
        const message = JSON.parse(raw.toString());
        if (message.type !== 'authenticate') throw new Error('Authentication required');
        const user = jwt.verify(message.token, process.env.JWT_SECRET || '') as AuthPayload;
        if (!user.userId) throw new Error('Invalid identity');
        const assignmentId = message.assignmentId;
        if (assignmentId) {
          const assignment = await AssignmentModel.findById(assignmentId);
          if (!assignment || (user.role !== 'admin' && assignment.createdBy !== user.userId)) throw new Error('Forbidden');
        }
        if (ws.readyState !== WebSocket.OPEN) return;
        if (assignmentId) {
          if (!rooms.has(assignmentId)) rooms.set(assignmentId, new Set());
          rooms.get(assignmentId)!.add(ws);
          ws.on('close', () => { rooms.get(assignmentId)?.delete(ws); if (!rooms.get(assignmentId)?.size) rooms.delete(assignmentId); });
        }
        ws.send(JSON.stringify({ type: 'authenticated' }));
        if (!userSockets.has(user.userId)) userSockets.set(user.userId, new Set());
        userSockets.get(user.userId)!.add(ws);
        ws.on('close', () => { userSockets.get(user.userId)?.delete(ws); if (!userSockets.get(user.userId)?.size) userSockets.delete(user.userId); });
      } catch { ws.close(1008, 'Unauthorized'); }
    });
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